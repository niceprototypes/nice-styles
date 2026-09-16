/**
 * Token source reader — the single read of `src/tokens/` for every build pipeline.
 *
 * `generateTokens`, `generateTypes`, and `generateCss` each call
 * `readTokenSources` and map the returned `TokenSourceModel` onto their output.
 * Reading, splitting, and validation happen here only.
 *
 * Must not import `src/constants/` (directly or through `validate.ts`): those
 * modules import `src/generated/`, which `generateTokens` creates from this read.
 *
 * ## Source files
 *
 * | File | Shape | Role |
 * |------|-------|------|
 * | `modules/{group}.json` | `{ variant: value, $themes?, $breakpoints?, $inverse? }` | One token group: base values plus its override axes |
 * | `components/{prefix}.json` | `{ ...nested tree, $themes?, $breakpoints? }` | One component's token tree plus its override axes |
 * | `breakpoints.json` | `{ tablet: 641, … }` | Pixel floors |
 * | `../errors.json` | `{ key: template }` | Validation message templates |
 *
 * ## Splitting
 * - A module group listed under any `$themes` entry is themed: its base values
 *   go to `themes.day`, otherwise to `core`.
 * - `night` is the OS dark default (`themes.night`); every other theme name is
 *   an extra (`themes.extras`). Components split the same way.
 * - Each `$inverse` sub-module is its own base (`inverse.day`) plus `$themes.night`
 *   (`inverse.night`), keyed by the base group name.
 *
 * ## Validation
 * Throws when an override has no base to override: night, inverse night, and
 * extra themes against their base groups; component night, extra themes, and
 * breakpoints against the component base tree.
 */

import * as fs from 'fs'
import * as path from 'path'
import { readModuleFolder } from './readModuleFolder.js'
import { validateNightTokens, validateComponentNightTokens, validateComponentBreakpointTokens } from '../css/validate.js'
import type { ComponentTokens, Errors, Tokens, TokenSourceModel, TokenTree } from './types.js'

/** The theme mapped to `prefers-color-scheme: dark`; every other theme name is an extra. */
const NIGHT_THEME = 'night'

/** An `$inverse` sub-module: base variants plus its own `$themes`. */
type InverseSubmodule = { $themes?: Record<string, Tokens[string]>; [variant: string]: unknown }

/** The combined module folder, as `readModuleFolder` reassembles it. */
type ModuleFolder = Tokens & {
  $themes?: Record<string, Tokens>
  $breakpoints?: TokenSourceModel['breakpointTokens']
  $inverse?: Record<string, InverseSubmodule>
}

/** One `components/{prefix}.json` file. */
type ComponentFile = TokenTree & {
  $themes?: Record<string, TokenTree>
  $breakpoints?: Record<string, TokenTree>
}

/**
 * Read `modules/*.json` and split base values from their override axes.
 *
 * @param tokensDir - Absolute path to `src/tokens/`
 * @returns The module slice of the model: `core`, `themes`, `breakpointTokens`, `inverse`
 */
function readModules(tokensDir: string): Pick<TokenSourceModel, 'core' | 'themes' | 'breakpointTokens' | 'inverse'> {
  // Reserved sections default to `{}` — readModuleFolder omits the ones no file defines
  const { $themes = {}, $breakpoints = {}, $inverse = {}, ...base } = readModuleFolder<ModuleFolder>(tokensDir)

  // Themed groups = every group any theme overrides (night or extra). Their base
  // values go to `themes.day`, which the day/night emitters pair with `themes.night`
  const themedGroups = new Set(Object.values($themes).flatMap((groups) => Object.keys(groups)))
  const core: Tokens = {}
  const day: Tokens = {}
  for (const [group, variants] of Object.entries(base)) {
    if (themedGroups.has(group)) day[group] = variants
    else core[group] = variants
  }

  // Every theme except night is pin-only (no prefers-color-scheme block)
  const extras: Record<string, Tokens> = {}
  for (const [theme, groups] of Object.entries($themes)) {
    if (theme !== NIGHT_THEME) extras[theme] = groups
  }

  // Every inverse group gets a night entry, empty when it has no $themes.night
  const inverse: TokenSourceModel['inverse'] = { day: {}, night: {} }
  for (const [group, { $themes: inverseThemes, ...inverseBase }] of Object.entries($inverse)) {
    inverse.day[group] = inverseBase as Tokens[string]
    inverse.night[group] = inverseThemes?.[NIGHT_THEME] ?? {}
  }

  return {
    core,
    themes: { day, night: $themes[NIGHT_THEME] ?? {}, extras },
    breakpointTokens: $breakpoints,
    inverse,
  }
}

/**
 * Read `components/*.json` (sorted by prefix) and split each tree from its override axes.
 *
 * @param tokensDir - Absolute path to `src/tokens/`
 * @returns The `components` slice of the model; a prefix appears in an override
 *   map only when its file defines that override
 */
function readComponents(tokensDir: string): TokenSourceModel['components'] {
  const componentsDir = path.join(tokensDir, 'components')
  const files = fs.readdirSync(componentsDir).filter((file) => file.endsWith('.json')).sort()
  const components: TokenSourceModel['components'] = { base: {}, themes: { night: {}, extras: {} }, breakpoints: {} }

  for (const file of files) {
    // The file stem is the component prefix (`button.json` → `button`)
    const prefix = file.replace(/\.json$/, '')
    const { $themes, $breakpoints, ...base }: ComponentFile = JSON.parse(fs.readFileSync(path.join(componentsDir, file), 'utf-8'))
    components.base[prefix] = base

    // Same night / extra split as modules
    if ($themes?.[NIGHT_THEME]) components.themes.night[prefix] = $themes[NIGHT_THEME]
    const extras = Object.fromEntries(Object.entries($themes ?? {}).filter(([theme]) => theme !== NIGHT_THEME))
    if (Object.keys(extras).length > 0) components.themes.extras[prefix] = extras

    if ($breakpoints) components.breakpoints[prefix] = $breakpoints
  }

  return components
}

/**
 * Throw on any override without a base to override. Logs one line per check that ran.
 *
 * @param model - The assembled source model
 * @param errors - Message templates from `src/errors.json` (flat checks only)
 * @throws on the first invalid override (see `scripts/css/validate.ts`)
 */
function validate(model: TokenSourceModel, errors: Errors): void {
  const { themes, inverse, components } = model

  // Flat module overrides — night, inverse night, then each extra theme, all against their day base
  if (Object.keys(themes.night).length > 0) {
    validateNightTokens(themes.day, themes.night, errors)
    console.log('✓ Themes module night tokens validated')
  }
  if (Object.keys(inverse.night).length > 0) {
    validateNightTokens(inverse.day, inverse.night, errors)
    console.log('✓ Inverse night tokens validated')
  }
  for (const [theme, groups] of Object.entries(themes.extras)) {
    validateNightTokens(themes.day, groups, errors)
    console.log(`✓ Themes module "${theme}" tokens validated`)
  }

  // Component overrides — night and breakpoints against each component's base tree
  if (Object.keys(components.themes.night).length > 0) {
    validateComponentNightTokens(components.base, components.themes.night)
    console.log('✓ Component night tokens validated')
  }
  if (Object.keys(components.breakpoints).length > 0) {
    validateComponentBreakpointTokens(components.base, components.breakpoints)
    console.log('✓ Component breakpoint tokens validated')
  }

  // Extra themes validate per theme, so regroup prefix → theme as theme → prefix
  const extrasByTheme: Record<string, ComponentTokens> = {}
  for (const [prefix, byTheme] of Object.entries(components.themes.extras)) {
    for (const [theme, tree] of Object.entries(byTheme)) (extrasByTheme[theme] ??= {})[prefix] = tree
  }
  for (const [theme, byPrefix] of Object.entries(extrasByTheme)) {
    validateComponentNightTokens(components.base, byPrefix)
    console.log(`✓ Component "${theme}" tokens validated`)
  }
}

/**
 * @param tokensDir - Absolute path to `src/tokens/`; `errors.json` is read from its parent
 * @returns The validated source model
 * @throws on an override without a matching base value or path
 */
export function readTokenSources(tokensDir: string): TokenSourceModel {
  // Read every source into the model first, so validation sees exactly what the writers will
  const model: TokenSourceModel = {
    ...readModules(tokensDir),
    components: readComponents(tokensDir),
    thresholds: JSON.parse(fs.readFileSync(path.join(tokensDir, 'breakpoints.json'), 'utf-8')),
  }

  // Validate before returning — no pipeline writes output from an invalid model
  const errors: Errors = JSON.parse(fs.readFileSync(path.join(tokensDir, '..', 'errors.json'), 'utf-8'))
  validate(model, errors)

  return model
}
