/**
 * Component alias auto-propagation emitter.
 *
 * ## Problem this solves
 *
 * A component token whose value is a bare alias to a core token —
 * `--np--typography--color--light: var(--np--color--light)` — is emitted only
 * at `:root`. CSS custom-property substitution freezes that `var()` at `:root`
 * scope, so a `[data-theme="night"]` pin (which reassigns the *core*
 * `--np--color--light`, not the typography token) never reaches it. The
 * component token silently follows `:root`/OS instead of the pin.
 *
 * `emitComponentTokens` only fixes this when the component JSON authors a
 * `$themes.night` override at that path; pure aliases carry none, so they leak.
 *
 * ## What this emitter does
 *
 * For every component token that is a bare alias `var(--np--<core>)`, it looks
 * up which scopes the referenced *core* token participates in (theme/night,
 * breakpoints, extra themes) and emits a parallel reassignment of the component
 * token into each of those scopes, pointing at the core's stable primitive
 * (`--np--<core>--night`, `--np--<core>--laptop`, …). The core primitives
 * already exist, so no new primitives are minted — one reassignment line per
 * (alias, scope).
 *
 * ## Precedence
 *
 * An authored override always wins: when the component JSON already declares an
 * override at a path+scope (`$themes.night`, `$breakpoints.{bp}`,
 * `$themes.{extra}`), that path+scope is skipped here so the authored value (in
 * the other emitters) is the only declaration. Skipping is per-variant, so
 * partial authoring composes — authored variants use the authored value, the
 * rest auto-propagate.
 */

import { getConstantKey } from '../../src/services/getConstant.js'
import { buildCssKey } from './emitComponentTokens.js'
import {
  BREAKPOINTS,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../../src/constants/breakpoints.js'
import type {
  ComponentTokens, ComponentBreakpointTokens, NightTokens, BreakpointTokens, Tokens, TokenNode,
} from './types.js'

/** Override breakpoints in phone-first ascending order (phone is the implicit default). */
const OVERRIDE_BREAKPOINTS = [BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const

/** Which scopes a single core semantic var has primitives in. */
interface CoreScopes {
  /** Core has a `--night` primitive (themed group). */
  night: boolean
  /** Breakpoint names whose primitive exists for this core var. */
  breakpoints: Set<string>
  /** Extra (non-night) theme names whose primitive exists for this core var. */
  extraThemes: Set<string>
}

export interface ComponentAliasResult {
  /** Reassignment lines for the shared night-media accumulator (→ @media dark + [data-theme] pins). */
  nightMediaBody: string[]
  /** Complete `@media (min-width)` blocks, ready to append after :root. */
  bpMediaBlocks: string[]
  /** Complete `[data-theme="{theme}"]` blocks for extra themes, ready to append after :root. */
  extraPinBlocks: string[]
}

/**
 * Build a map from core semantic var name → the scopes it participates in.
 * Keys are produced with `getConstantKey` so they match the var names the
 * alias JSON values reference exactly.
 *
 * Inverse (`$inverse`) is intentionally excluded — alias values reference the
 * base semantic var, never the `--inverse` dimension, so inverse propagation is
 * a separate concern.
 */
export function buildCoreScopeMap(
  nightTokens: NightTokens,
  sizeTokens: BreakpointTokens,
  extraThemes: Record<string, Tokens>,
): Map<string, CoreScopes> {
  const map = new Map<string, CoreScopes>()
  const ensure = (key: string): CoreScopes => {
    let scopes = map.get(key)
    if (!scopes) {
      scopes = { night: false, breakpoints: new Set(), extraThemes: new Set() }
      map.set(key, scopes)
    }
    return scopes
  }

  // Night — every core var a themed group overrides for the night theme.
  for (const [group, variants] of Object.entries(nightTokens)) {
    for (const variant of Object.keys(variants)) ensure(getConstantKey(group, variant)).night = true
  }

  // Breakpoints — every core var with a non-phone breakpoint primitive.
  for (const [bp, groups] of Object.entries(sizeTokens)) {
    if (!OVERRIDE_BREAKPOINTS.includes(bp as typeof OVERRIDE_BREAKPOINTS[number])) continue
    for (const [group, variants] of Object.entries(groups)) {
      for (const variant of Object.keys(variants)) ensure(getConstantKey(group, variant)).breakpoints.add(bp)
    }
  }

  // Extra (non-night) themes — every core var the theme overrides.
  for (const [theme, groups] of Object.entries(extraThemes)) {
    for (const [group, variants] of Object.entries(groups)) {
      for (const variant of Object.keys(variants)) ensure(getConstantKey(group, variant)).extraThemes.add(theme)
    }
  }

  return map
}

/**
 * Extract the core var name from a bare alias value: `var(--np--color--light)`
 * → `--np--color--light`. Returns null when the value is anything other than a
 * single bare `var(--np--…)` reference. A component-to-component alias parses
 * here but is filtered downstream by the scope-map lookup (it holds core vars
 * only).
 */
function extractCoreVar(value: string): string | null {
  const match = value.match(/^var\((--np--[a-z0-9-]+)\)$/)
  return match ? match[1] : null
}

/** True when an authored override tree has a string leaf at the given path. */
function hasLeafAt(tree: { [key: string]: TokenNode } | undefined, path: string[]): boolean {
  let node: TokenNode | undefined = tree
  for (const segment of path) {
    if (!node || typeof node !== 'object') return false
    node = (node as { [key: string]: TokenNode })[segment]
  }
  return typeof node === 'string'
}

/**
 * Walk every component token tree and emit scope reassignments for bare aliases
 * to scoped core tokens, skipping any path+scope an authored override owns.
 */
export function generateComponentAliasCss(
  componentTokens: ComponentTokens,
  componentNightTokens: ComponentTokens,
  componentBreakpointTokens: ComponentBreakpointTokens,
  componentExtraThemes: Record<string, Record<string, { [key: string]: TokenNode }>>,
  coreScopes: Map<string, CoreScopes>,
): ComponentAliasResult {
  const nightMediaBody: string[] = []
  const bpBuckets: Record<string, string[]> = {}
  const extraBuckets: Record<string, string[]> = {}

  for (const [prefix, tree] of Object.entries(componentTokens)) {
    const authoredNight = componentNightTokens[prefix]
    const authoredBp = componentBreakpointTokens[prefix]
    const authoredExtra = componentExtraThemes[prefix]

    const walk = (node: { [key: string]: TokenNode }, path: string[]): void => {
      for (const [key, value] of Object.entries(node)) {
        const newPath = [...path, key]

        if (typeof value === 'string') {
          // Only bare aliases to a *scoped* core token propagate — everything
          // else (literals, component-to-component aliases, unscoped cores) is skipped.
          const coreVar = extractCoreVar(value)
          if (!coreVar) continue
          const scopes = coreScopes.get(coreVar)
          if (!scopes) continue
          const cssKey = buildCssKey(prefix, newPath)

          // Theme/night — authored $themes.night at this path wins, so skip it.
          if (scopes.night && !hasLeafAt(authoredNight, newPath)) {
            nightMediaBody.push(`\t\t${cssKey}: var(${coreVar}--night);`)
          }

          // Breakpoints — per-bp; authored $breakpoints.{bp} at this path wins.
          for (const bp of scopes.breakpoints) {
            const authoredForBp = authoredBp?.[bp] as { [key: string]: TokenNode } | undefined
            if (hasLeafAt(authoredForBp, newPath)) continue
            ;(bpBuckets[bp] ??= []).push(`\t\t${cssKey}: var(${coreVar}--${bp});`)
          }

          // Extra themes — per-theme; authored $themes.{extra} at this path wins.
          for (const theme of scopes.extraThemes) {
            if (hasLeafAt(authoredExtra?.[theme], newPath)) continue
            ;(extraBuckets[theme] ??= []).push(`\t${cssKey}: var(${coreVar}--${theme});`)
          }
          continue
        }

        if (value && typeof value === 'object') walk(value as { [key: string]: TokenNode }, newPath)
      }
    }

    walk(tree as { [key: string]: TokenNode }, [])
  }

  // Assemble breakpoint @media blocks in ascending min-width order so wider
  // breakpoints win in the cascade (desktop after laptop after tablet).
  const bpMediaBlocks: string[] = []
  for (const bp of OVERRIDE_BREAKPOINTS) {
    const lines = bpBuckets[bp]
    if (!lines || lines.length === 0) continue
    bpMediaBlocks.push('', `@media (min-width: ${BREAKPOINTS[bp]}px) {`, '\t:root {', ...lines, '\t}', '}')
  }

  // Assemble one [data-theme="{theme}"] pin block per extra theme.
  const extraPinBlocks: string[] = []
  for (const [theme, lines] of Object.entries(extraBuckets)) {
    if (lines.length === 0) continue
    extraPinBlocks.push('', `[data-theme="${theme}"] {`, ...lines, '}')
  }

  return { nightMediaBody, bpMediaBlocks, extraPinBlocks }
}