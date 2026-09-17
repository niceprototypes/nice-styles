/**
 * Token registry barrel.
 *
 * Importing this module seeds the store from every generated source — flat
 * core tokens, theme tokens, breakpoint tokens, inverse tokens, and component
 * token trees — into the `seed` layer of one registry keyed by CSS variable name.
 *
 * Imported for its side effect by `src/init.ts` (from the package entry), so
 * the store is full before any getter runs.
 *
 * ## Input
 * The generated modules in `src/generated/` (written by `build:tokens`).
 *
 * ## Output
 * One `TokenEntry` per variant. A themed or breakpoint-driven variant is one
 * entry whose seed is an object: `{ day, night }` or `{ phone, tablet, laptop, desktop }`.
 *
 * @example
 * // themeTokensData: { day: { color: { base: "#222" } }, night: { color: { base: "#eee" } } }
 * // registry.get("--np--color").seed → { day: "#222", night: "#eee" }
 */

import tokensData from '../generated/tokensData.js'
import themeTokensData from '../generated/themeTokensData.js'
import breakpointTokensData from '../generated/breakpointTokensData.js'
import inverseTokensData from '../generated/inverseTokensData.js'
import componentTokensData from '../generated/componentTokensData.js'
import breakpointsData from '../generated/breakpointsData.js'
import { walkTokenTree } from '../utilities/css/treeWalk.js'
import { buildCoreInverseMap, extractCoreVar } from '../utilities/css/componentInverseCss.js'
import { writeToken, type TokenValue } from './createRegistry.js'

/**
 * Write one generated value into the seed layer.
 *
 * @param prefix - Component prefix, or undefined for core tokens
 * @param path - Group path
 * @param variant - Variant name
 * @param value - Plain value, or a folded theme / breakpoint object
 * @param inverse - Inverse-color dimension
 */
function seed(prefix: string | undefined, path: string[], variant: string, value: TokenValue, inverse = false): void {
  writeToken('seed', { prefix, path, variant, inverse }, value)
}

/**
 * Fold `{ dimension: { group: { variant: value } } }` (theme- or
 * breakpoint-keyed modules) into one `{ dimension: value }` object per variant.
 *
 * @param data - Dimension-keyed module (`themeTokensData`, `breakpointTokensData`)
 * @returns `{ group: { variant: { dimension: value } } }`
 *
 * @example
 * foldDimensions({ phone: { fontSize: { large: "20px" } }, laptop: { fontSize: { large: "24px" } } })
 * // → { fontSize: { large: { phone: "20px", laptop: "24px" } } }
 */
function foldDimensions(
  data: Record<string, Record<string, Record<string, string>>>
): Record<string, Record<string, Record<string, string>>> {
  const folded: Record<string, Record<string, Record<string, string>>> = {}
  for (const [dimension, groups] of Object.entries(data)) {
    for (const [group, variants] of Object.entries(groups)) {
      for (const [variant, value] of Object.entries(variants)) {
        // Create the group and variant slots on first sight, then add this dimension's value
        folded[group] ??= {}
        folded[group][variant] ??= {}
        folded[group][variant][dimension] = value
      }
    }
  }
  return folded
}

/**
 * Seed a folded module: one entry per group/variant.
 *
 * @param folded - Output of `foldDimensions`
 * @param inverse - Seed as the inverse-color dimension
 */
function seedFolded(folded: Record<string, Record<string, Record<string, string>>>, inverse = false): void {
  for (const [group, variants] of Object.entries(folded)) {
    for (const [variant, dimensions] of Object.entries(variants)) {
      seed(undefined, [group], variant, dimensions, inverse)
    }
  }
}

// Seeding order only matters for iteration order (listTokens); keys never collide
// across these sources except by design (a later source replaces an earlier seed).

// Flat core tokens (animationDuration, gap, borderRadius, …).
for (const [group, variants] of Object.entries(tokensData)) {
  for (const [variant, value] of Object.entries(variants)) {
    seed(undefined, [group], variant, value)
  }
}

// Theme tokens → { day, night } per variant.
seedFolded(foldDimensions(themeTokensData))

// Breakpoint tokens → { phone, tablet, laptop, desktop } per variant.
seedFolded(foldDimensions(breakpointTokensData))

// Inverse tokens are keyed group → theme → variant; reorder to theme → group → variant, then fold.
const inverseByTheme: Record<string, Record<string, Record<string, string>>> = {}
for (const [group, themes] of Object.entries(inverseTokensData)) {
  for (const [theme, variants] of Object.entries(themes)) {
    inverseByTheme[theme] ??= {}
    inverseByTheme[theme][group] = variants
  }
}
seedFolded(foldDimensions(inverseByTheme), true)

// Breakpoint thresholds — addressed as `breakpoints:{name}`, stored with the `px`
// unit so the value form and the emitted custom property agree. `phone` has no
// floor of its own (it is everything below the first one), so it is not seeded.
for (const [name, px] of Object.entries(breakpointsData)) {
  seed(undefined, ['breakpoints'], name, `${px}px`)
}

// Component color tokens alias core colors, and the CSS derives an `--inverse`
// variable for each such alias (see `componentInverseCss`). Mirror that here so
// `getToken("ink.color:base:inverse")` resolves instead of warning.
const coreInverse = buildCoreInverseMap(inverseByTheme.day ?? {}, inverseByTheme.night ?? {})

// Component token trees — every string leaf is a variant of its parent group path.
for (const [prefix, tree] of Object.entries(componentTokensData)) {
  walkTokenTree(tree, (path, value) => {
    const group = path.slice(0, -1)
    const variant = path[path.length - 1]
    seed(prefix, group, variant, value)

    // Bare aliases to a core color gain the derived inverse entry
    const coreVar = extractCoreVar(value)
    const target = coreVar ? coreInverse.get(coreVar) : undefined
    if (target) seed(prefix, group, variant, `var(${target.inverse})`, true)
  })
}

// Public surface of the registry
export { registry } from './createRegistry.js'
export type { TokenEntry, TokenValue, TokenLayer, TokenIdentity } from './createRegistry.js'
export { registerTokens } from './registerTokens.js'
