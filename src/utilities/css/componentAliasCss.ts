/**
 * Component alias auto-propagation.
 *
 * A component token whose value is a bare alias to a core token —
 * `--np--ink--color--light: var(--np--color--light)` — is declared only at
 * `:root`, where the `var()` substitutes once. A `[data-theme="night"]` pin or a
 * `min-width` media block reassigns the *core* variable, not the component
 * variable, so without propagation the component token would stay on its
 * `:root` value.
 *
 * For every bare alias to a scoped core token, this emits a parallel
 * reassignment of the component variable into each scope the core participates
 * in (night, breakpoints, extra themes), pointing at the core's stable primitive
 * (`--np--<core>--night`, `--np--<core>--laptop`, …). No new primitives are
 * minted. Shared by the build (`dist/tokens.css`) and `applyBreakpoints`.
 *
 * ## Precedence
 * An authored override at a path + scope (`$themes.night`, `$breakpoints.{bp}`,
 * `$themes.{extra}`) wins: that path + scope is skipped here, so the authored
 * value from the component emitters is the only declaration.
 *
 * ## Input
 * Component token trees, their authored override trees, and a core scope map
 * from `buildCoreScopeMap`.
 *
 * ## Output
 * - `nightMediaBody` / `dayPinBody` — merged into the day/night theme blocks.
 * - `bpMediaBlocks` — after the core and component breakpoint blocks.
 * - `extraPinBlocks` — after the extra-theme pins.
 *
 * @example
 * // input: ink color.light = "var(--np--color--light)"; core color.light has a night value
 * // output (nightMediaBody): "\t\t--np--ink--color--light: var(--np--color--light--night);"
 */

import { getConstantKey } from '../../services/getConstant.js'
import { minWidthBlock, pinBlock } from './blocks.js'
import { extractCoreVar } from './componentInverseCss.js'
import { reassignmentLine } from './declarations.js'
import { leafAt, walkTokenTree } from './treeWalk.js'
import { BREAKPOINTS, SETTABLE_BREAKPOINTS, type SettableBreakpoint } from '../../constants/breakpoints.js'
import type { FlatTokens, TokenTree } from './types.js'

/** The scopes one core semantic variable has primitives in. */
export interface CoreScopes {
  /** The core variable has a `--night` primitive (its group is themed) */
  night: boolean
  /** Settable breakpoints that have a `--{breakpoint}` primitive for it */
  breakpoints: Set<string>
  /** Extra (non-night) themes that have a `--{theme}` primitive for it */
  extraThemes: Set<string>
}

/** Lines produced by `generateComponentAliasCss`. */
export interface ComponentAliasCss {
  /** Reassignments to core `--night` primitives (prefers-color-scheme block + night pin) */
  nightMediaBody: string[]
  /** The matching reassignments to core `--day` primitives (day pin) */
  dayPinBody: string[]
  /** `@media (min-width)` blocks, ascending */
  bpMediaBlocks: string[]
  /** One `[data-theme="{theme}"]` block per extra theme */
  extraPinBlocks: string[]
}

/**
 * Map each core semantic variable name to the scopes it participates in.
 * Inverse is excluded — alias values reference the base semantic variable, never `--inverse`.
 *
 * @param nightTokens - Core night overrides (`$themes.night`)
 * @param breakpointTokens - Core breakpoint data keyed by breakpoint (`$breakpoints`)
 * @param extraThemes - Core extra-theme overrides keyed by theme name
 * @returns Semantic variable name (`--np--color--light`) → its scopes; variables in no scope are absent
 */
export function buildCoreScopeMap(
  nightTokens: FlatTokens,
  breakpointTokens: Record<string, FlatTokens>,
  extraThemes: Record<string, FlatTokens>
): Map<string, CoreScopes> {
  const map = new Map<string, CoreScopes>()
  // Get-or-create: a variable gets an entry the first time any scope names it
  const scopesFor = (key: string): CoreScopes => {
    let scopes = map.get(key)
    if (!scopes) {
      scopes = { night: false, breakpoints: new Set(), extraThemes: new Set() }
      map.set(key, scopes)
    }
    return scopes
  }

  // Night — every core variable a themed group overrides for night
  for (const [group, variants] of Object.entries(nightTokens)) {
    for (const variant of Object.keys(variants)) scopesFor(getConstantKey(group, variant)).night = true
  }

  // Breakpoints — every core variable with a primitive at a settable breakpoint (phone is the base)
  for (const [bp, groups] of Object.entries(breakpointTokens)) {
    if (!SETTABLE_BREAKPOINTS.includes(bp as SettableBreakpoint)) continue
    for (const [group, variants] of Object.entries(groups)) {
      for (const variant of Object.keys(variants)) scopesFor(getConstantKey(group, variant)).breakpoints.add(bp)
    }
  }

  // Extra themes — every core variable an extra theme overrides
  for (const [theme, groups] of Object.entries(extraThemes)) {
    for (const [group, variants] of Object.entries(groups)) {
      for (const variant of Object.keys(variants)) scopesFor(getConstantKey(group, variant)).extraThemes.add(theme)
    }
  }

  return map
}

/**
 * Emit the alias reassignments for every component token that is a bare alias
 * to a scoped core variable.
 *
 * @param componentTokens - Component base trees keyed by prefix
 * @param componentNightTokens - Authored `$themes.night` trees keyed by prefix
 * @param componentBreakpointTokens - Authored `$breakpoints` trees keyed by prefix, then breakpoint
 * @param componentExtraThemes - Authored extra-theme trees keyed by prefix, then theme
 * @param coreScopes - Scope map from `buildCoreScopeMap`
 * @returns Theme bodies and complete breakpoint / extra-theme blocks (see `ComponentAliasCss`)
 */
export function generateComponentAliasCss(
  componentTokens: Record<string, TokenTree>,
  componentNightTokens: Record<string, TokenTree>,
  componentBreakpointTokens: Record<string, Record<string, TokenTree>>,
  componentExtraThemes: Record<string, Record<string, TokenTree>>,
  coreScopes: Map<string, CoreScopes>
): ComponentAliasCss {
  // Night lines are returned as bodies (merged into the shared theme blocks);
  // breakpoint and extra-theme lines are bucketed and wrapped into blocks below
  const nightMediaBody: string[] = []
  const dayPinBody: string[] = []
  const bpBuckets: Record<string, string[]> = {}
  const extraBuckets: Record<string, string[]> = {}

  for (const [prefix, tree] of Object.entries(componentTokens)) {
    walkTokenTree(tree, (path, value) => {
      // Only bare aliases to a scoped core token propagate — literals and unscoped cores are skipped
      const coreVar = extractCoreVar(value)
      if (!coreVar) return
      const scopes = coreScopes.get(coreVar)
      if (!scopes) return
      const cssKey = getConstantKey(`${prefix}.${path.join('.')}`)

      // Night — an authored $themes.night leaf at this path wins. The day line is
      // needed too: a `[data-theme="day"]` pin under an OS dark preference must
      // point the component var back at the core's day primitive
      if (scopes.night && leafAt(componentNightTokens[prefix], path) === undefined) {
        nightMediaBody.push(reassignmentLine(cssKey, `${coreVar}--night`))
        dayPinBody.push(reassignmentLine(cssKey, `${coreVar}--day`))
      }

      // Breakpoints — per breakpoint; an authored $breakpoints.{bp} leaf wins
      for (const bp of scopes.breakpoints) {
        if (leafAt(componentBreakpointTokens[prefix]?.[bp], path) !== undefined) continue
        ;(bpBuckets[bp] ??= []).push(reassignmentLine(cssKey, `${coreVar}--${bp}`))
      }

      // Extra themes — per theme; an authored $themes.{extra} leaf wins.
      // Depth 1: pin blocks have no inner `:root`
      for (const theme of scopes.extraThemes) {
        if (leafAt(componentExtraThemes[prefix]?.[theme], path) !== undefined) continue
        ;(extraBuckets[theme] ??= []).push(reassignmentLine(cssKey, `${coreVar}--${theme}`, 1))
      }
    })
  }

  // Ascending min-width so wider breakpoints win in the cascade
  const bpMediaBlocks = SETTABLE_BREAKPOINTS.flatMap((bp) => minWidthBlock(BREAKPOINTS[bp], bpBuckets[bp] ?? []))
  // One pin block per extra theme, in first-encountered order
  const extraPinBlocks = Object.entries(extraBuckets).flatMap(([theme, lines]) => pinBlock(theme, lines))

  return { nightMediaBody, dayPinBody, bpMediaBlocks, extraPinBlocks }
}
