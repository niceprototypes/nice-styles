/**
 * Token source reader.
 *
 * Reads all JSON token source files and validates cross-module consistency.
 * Returns a fully resolved, typed data structure ready for the CSS pipeline.
 *
 * ## Source files
 *
 * | File | Shape | Role |
 * |------|-------|------|
 * | `module.json` | `{ group: { item: value } }` | Comprehensive base — static + default-theme values for theme-conditional groups |
 * | `module.themes.json` | `{ night: { group: { item: value } }, … }` | Alternative themes keyed by name; partial overrides of the base |
 * | `module.breakpoints.json` | `{ phone: {...}, tablet: {...}, laptop: {...}, desktop: {...} }` | Size tokens keyed by breakpoint |
 * | `component.json` | `{ day: { prefix: { ...nested } }, night: {...} }` | Component tokens keyed by theme |
 *
 * Themed groups (color, backgroundColor, borderColor, …) are split out of the
 * merged base file by checking which group names appear in any alt theme.
 *
 * ## Merge strategy
 *
 * The `tokens` field in the returned object is a unified map of all semantic defaults:
 * - Core tokens (no variants)
 * - Color day values (the base for theme-conditional groups)
 * - Size small values from `module.breakpoints.json` → phone dimension
 *
 * This merged map drives both the `:root` semantic variable emission and the
 * per-group individual CSS files in `dist/css/`.
 */

import * as fs from 'fs'
import * as path from 'path'
import { readModuleFolder } from '../shared/readModuleFolder.js'
import type { Tokens, NightTokens, ComponentTokens, ComponentBreakpointTokens, BreakpointTokens, Errors } from '../css/types.js'
import { validateNightTokens, validateComponentNightTokens, validateComponentBreakpointTokens } from '../css/validate.js'
import { BREAKPOINT_PHONE } from '../../src/constants/breakpoints.js'

export interface TokenSources {
  /** Merged semantic defaults: core + color day + size phone */
  tokens: Tokens
  /** Night-theme overrides from module.themes.json */
  nightTokens: NightTokens
  /** Full breakpoints module data for breakpoint primitive/media query emission */
  sizeTokens: BreakpointTokens
  /** Component day tokens from component.json */
  componentTokens: ComponentTokens
  /** Component night overrides from component.json */
  componentNightTokens: ComponentTokens
  /** Component breakpoint overrides (per prefix → breakpoint → partial tree) */
  componentBreakpointTokens: ComponentBreakpointTokens
}

/**
 * Read per-component token files. Globs `*.component.json` (base content) and
 * `*.component.themes.json` (alt-theme overrides). Folds each into the legacy
 * `componentTokens` / `componentNightTokens` shape so downstream emit code is
 * unchanged.
 */
function readComponentTokens(tokensDir: string): {
  componentTokens: ComponentTokens
  componentNightTokens: ComponentTokens
  componentBreakpointTokens: ComponentBreakpointTokens
} {
  const componentsDir = path.join(tokensDir, 'components')
  const baseFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.json')).sort()
  const componentTokens: ComponentTokens = {}
  const componentNightTokens: ComponentTokens = {}
  const componentBreakpointTokens: ComponentBreakpointTokens = {}
  for (const filename of baseFiles) {
    const prefix = filename.replace(/\.json$/, '')
    const parsed: Record<string, unknown> & {
      $themes?: Record<string, unknown>
      $breakpoints?: Record<string, unknown>
    } = JSON.parse(fs.readFileSync(path.join(componentsDir, filename), 'utf-8'))
    // Reserved override axes live under `$themes` / `$breakpoints` inside the file.
    const { $themes, $breakpoints, ...base } = parsed
    componentTokens[prefix] = base as ComponentTokens[string]
    if ($themes && $themes.night) {
      componentNightTokens[prefix] = $themes.night as ComponentTokens[string]
    }
    if ($breakpoints) {
      componentBreakpointTokens[prefix] = $breakpoints as ComponentBreakpointTokens[string]
    }
  }
  return { componentTokens, componentNightTokens, componentBreakpointTokens }
}

/**
 * Read base + alt-themes data and reconstitute the legacy `{coreTokens,
 * themesDay, nightTokens}` split. Themed groups are split out of the merged
 * base file by checking which group names appear in any alt theme.
 */
function readModule(tokensDir: string): {
  coreTokens: Tokens
  themesDay: Tokens
  nightTokens: NightTokens
  sizeTokens: BreakpointTokens
} {
  const moduleJson = readModuleFolder<Tokens & { $themes?: Record<string, Tokens>; $breakpoints?: BreakpointTokens }>(tokensDir)
  // Alt themes and breakpoint overrides live under reserved `$themes` and
  // `$breakpoints` keys. Everything else at the top level is base.
  const { $themes: themes = {}, $breakpoints: embeddedBreakpoints, ...base } = moduleJson
  const themedGroups = new Set<string>(Object.values(themes).flatMap((t) => Object.keys(t)))
  const coreTokens: Tokens = {}
  const themesDay: Tokens = {}
  for (const [group, variants] of Object.entries(base)) {
    if (themedGroups.has(group)) themesDay[group] = variants
    else coreTokens[group] = variants
  }
  return {
    coreTokens,
    themesDay,
    nightTokens: themes.night || {},
    sizeTokens: embeddedBreakpoints ?? {},
  }
}

/**
 * Reads all token JSON sources, validates cross-module consistency,
 * and returns a merged, typed structure for the CSS pipeline.
 *
 * @param tokensDir - Absolute path to src/tokens/
 * @param errorsPath - Absolute path to src/errors.json (validation message templates)
 */
export function readTokenSources(tokensDir: string, errorsPath: string): TokenSources {
  const { coreTokens, themesDay, nightTokens, sizeTokens } = readModule(tokensDir)

  // Validate: every night entry must have a corresponding day entry
  const errors: Errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'))
  if (Object.keys(nightTokens).length > 0) {
    validateNightTokens(themesDay, nightTokens, errors)
    console.log('✓ Themes module night tokens validated')
  }

  // phone provides semantic defaults; tablet/laptop/desktop provide overrides
  const breakpointsPhone: Tokens = sizeTokens[BREAKPOINT_PHONE] || {}

  // Component tokens — glob per-prefix files; fall back to legacy component.json
  const { componentTokens, componentNightTokens, componentBreakpointTokens } = readComponentTokens(tokensDir)

  const componentCount = Object.keys(componentTokens).length
  if (componentCount > 0) {
    console.log(`✓ Loaded ${componentCount} component token sets: ${Object.keys(componentTokens).join(', ')}`)
  }

  // Validate: every component night entry must have a corresponding day entry
  if (Object.keys(componentNightTokens).length > 0) {
    validateComponentNightTokens(componentTokens, componentNightTokens)
    console.log('✓ Component night tokens validated')
  }

  // Validate: every component breakpoint entry must have a corresponding base entry
  if (Object.keys(componentBreakpointTokens).length > 0) {
    validateComponentBreakpointTokens(componentTokens, componentBreakpointTokens)
    console.log('✓ Component breakpoint tokens validated')
  }

  // Merge all sources into a unified semantic defaults map
  // Order: core → color day → size phone (later keys win on collision)
  const tokens: Tokens = { ...coreTokens, ...themesDay, ...breakpointsPhone }

  return { tokens, nightTokens, sizeTokens, componentTokens, componentNightTokens, componentBreakpointTokens }
}
