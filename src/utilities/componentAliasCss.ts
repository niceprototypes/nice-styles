/**
 * Component alias auto-propagation — shared by the build (`dist/tokens.css`) and
 * `applyBreakpoints` (runtime re-emission when `setTokens({ breakpoints })` changes thresholds).
 *
 * A component token whose value is a bare alias to a core token —
 * `--np--ink--color--light: var(--np--color--light)` — is declared only at
 * `:root`, where the `var()` substitutes once. A `[data-theme="night"]` pin or a
 * `min-width` media block reassigns the *core* var, not the component var, so the
 * component token would stay on the `:root` value.
 *
 * For every bare alias to a scoped core token, this emits a parallel reassignment
 * of the component var into each scope the core participates in (night,
 * breakpoints, extra themes), pointing at the core's stable primitive
 * (`--np--<core>--night`, `--np--<core>--laptop`, …).
 *
 * An authored override at a path+scope (`$themes.night`, `$breakpoints.{bp}`,
 * `$themes.{extra}`) wins: that path+scope is skipped here.
 */

import { getConstantKey } from '../services/getConstant.js'
import { minWidthBlock, pinBlock } from './tokenCss.js'
import {
  BREAKPOINTS,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../constants/breakpoints.js'
import type { ComponentTokenNode } from '../types/tokenMap.js'

type Tree = { [key: string]: ComponentTokenNode }
type FlatTokens = Record<string, Record<string, string>>

/** Override breakpoints in phone-first ascending order (phone is the implicit default). */
const OVERRIDE_BREAKPOINTS = [BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const

/** Which scopes a single core semantic var has primitives in. */
export interface CoreScopes {
  night: boolean
  breakpoints: Set<string>
  extraThemes: Set<string>
}

export interface ComponentAliasCss {
  /** Reassignments to `--night` primitives (→ prefers-color-scheme block + night pin). */
  nightMediaBody: string[]
  /** The matching reassignments to `--day` primitives (→ day pin). */
  dayPinBody: string[]
  /** `@media (min-width)` block lines. */
  bpMediaBlocks: string[]
  /** `[data-theme="{theme}"]` block lines for extra themes. */
  extraPinBlocks: string[]
}

/**
 * Map each core semantic var name to the scopes it participates in. Inverse is
 * excluded — alias values reference the base semantic var, never `--inverse`.
 */
export function buildCoreScopeMap(
  nightTokens: FlatTokens,
  breakpointTokens: Record<string, FlatTokens>,
  extraThemes: Record<string, FlatTokens>
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

  for (const [group, variants] of Object.entries(nightTokens)) {
    for (const variant of Object.keys(variants)) ensure(getConstantKey(group, variant)).night = true
  }

  for (const [bp, groups] of Object.entries(breakpointTokens)) {
    if (!OVERRIDE_BREAKPOINTS.includes(bp as typeof OVERRIDE_BREAKPOINTS[number])) continue
    for (const [group, variants] of Object.entries(groups)) {
      for (const variant of Object.keys(variants)) ensure(getConstantKey(group, variant)).breakpoints.add(bp)
    }
  }

  for (const [theme, groups] of Object.entries(extraThemes)) {
    for (const [group, variants] of Object.entries(groups)) {
      for (const variant of Object.keys(variants)) ensure(getConstantKey(group, variant)).extraThemes.add(theme)
    }
  }

  return map
}

/** `var(--np--color--light)` → `--np--color--light`; null for anything but a single bare var. */
function extractCoreVar(value: string): string | null {
  const match = value.match(/^var\((--np--[a-z0-9-]+)\)$/)
  return match ? match[1] : null
}

/** True when an authored override tree has a string leaf at the given path. */
function hasLeafAt(tree: Tree | undefined, path: string[]): boolean {
  let node: ComponentTokenNode | undefined = tree
  for (const segment of path) {
    if (!node || typeof node !== 'object') return false
    node = node[segment]
  }
  return typeof node === 'string'
}

export function generateComponentAliasCss(
  componentTokens: Record<string, Tree>,
  componentNightTokens: Record<string, Tree>,
  componentBreakpointTokens: Record<string, Record<string, Tree>>,
  componentExtraThemes: Record<string, Record<string, Tree>>,
  coreScopes: Map<string, CoreScopes>
): ComponentAliasCss {
  const nightMediaBody: string[] = []
  const dayPinBody: string[] = []
  const bpBuckets: Record<string, string[]> = {}
  const extraBuckets: Record<string, string[]> = {}

  for (const [prefix, tree] of Object.entries(componentTokens)) {
    const authoredNight = componentNightTokens[prefix]
    const authoredBp = componentBreakpointTokens[prefix]
    const authoredExtra = componentExtraThemes[prefix]

    const walk = (node: Tree, path: string[]): void => {
      for (const [key, value] of Object.entries(node)) {
        const newPath = [...path, key]

        if (typeof value === 'string') {
          const coreVar = extractCoreVar(value)
          if (!coreVar) continue
          const scopes = coreScopes.get(coreVar)
          if (!scopes) continue
          const cssKey = getConstantKey(newPath, 'base', { pkg: prefix })

          if (scopes.night && !hasLeafAt(authoredNight, newPath)) {
            nightMediaBody.push(`\t\t${cssKey}: var(${coreVar}--night);`)
            dayPinBody.push(`\t\t${cssKey}: var(${coreVar}--day);`)
          }

          for (const bp of scopes.breakpoints) {
            if (hasLeafAt(authoredBp?.[bp], newPath)) continue
            ;(bpBuckets[bp] ??= []).push(`\t\t${cssKey}: var(${coreVar}--${bp});`)
          }

          for (const theme of scopes.extraThemes) {
            if (hasLeafAt(authoredExtra?.[theme], newPath)) continue
            ;(extraBuckets[theme] ??= []).push(`\t${cssKey}: var(${coreVar}--${theme});`)
          }
          continue
        }

        if (value && typeof value === 'object') walk(value, newPath)
      }
    }

    walk(tree, [])
  }

  // Ascending min-width so wider breakpoints win in the cascade.
  const bpMediaBlocks = OVERRIDE_BREAKPOINTS.flatMap((bp) => minWidthBlock(BREAKPOINTS[bp], bpBuckets[bp] ?? []))
  const extraPinBlocks = Object.entries(extraBuckets).flatMap(([theme, lines]) => pinBlock(theme, lines))

  return { nightMediaBody, dayPinBody, bpMediaBlocks, extraPinBlocks }
}
