/**
 * Token registry barrel.
 *
 * Importing this module seeds the store from every generated source — flat
 * core tokens, theme tokens, breakpoint tokens, inverse tokens, and component
 * token trees — into the `seed` layer of one registry keyed by CSS variable name.
 */

import tokensData from '../generated/tokensData.js'
import themeTokensData from '../generated/themeTokensData.js'
import breakpointTokensData from '../generated/breakpointTokensData.js'
import inverseTokensData from '../generated/inverseTokensData.js'
import componentTokensData, { type ComponentTokenNode } from '../generated/componentTokensData.js'
import { getConstantKey } from '../services/getConstant.js'
import { registry, type TokenValue } from './createRegistry.js'

/** Write one generated value into the seed layer. */
function seed(prefix: string | undefined, path: string[], variant: string, value: TokenValue, inverse = false): void {
  const key = getConstantKey(path, variant, { pkg: prefix, inverse })
  const existing = registry.get(key)
  if (existing) {
    existing.seed = value
  } else {
    registry.set(key, { key, prefix, path, variant, inverse, seed: value })
  }
}

/**
 * Fold `{ dimension: { group: { variant: value } } }` (theme- or
 * breakpoint-keyed modules) into one `{ dimension: value }` object per variant.
 */
function foldDimensions(
  data: Record<string, Record<string, Record<string, string>>>
): Record<string, Record<string, Record<string, string>>> {
  const folded: Record<string, Record<string, Record<string, string>>> = {}
  for (const [dimension, groups] of Object.entries(data)) {
    for (const [group, variants] of Object.entries(groups)) {
      for (const [variant, value] of Object.entries(variants)) {
        folded[group] ??= {}
        folded[group][variant] ??= {}
        folded[group][variant][dimension] = value
      }
    }
  }
  return folded
}

/** Seed a folded module: one entry per group/variant. */
function seedFolded(folded: Record<string, Record<string, Record<string, string>>>, inverse = false): void {
  for (const [group, variants] of Object.entries(folded)) {
    for (const [variant, dimensions] of Object.entries(variants)) {
      seed(undefined, [group], variant, dimensions, inverse)
    }
  }
}

/** Seed a component token tree: every string leaf is a variant of its parent path. */
function seedComponentTree(prefix: string, node: { [key: string]: ComponentTokenNode }, path: string[]): void {
  for (const [name, child] of Object.entries(node)) {
    if (name.startsWith('$')) continue
    if (typeof child === 'string') {
      seed(prefix, path, name, child)
    } else {
      seedComponentTree(prefix, child, [...path, name])
    }
  }
}

// Flat core tokens (animationDuration, gap, borderRadius, …).
for (const [group, variants] of Object.entries(tokensData)) {
  for (const [variant, value] of Object.entries(variants as Record<string, string>)) {
    seed(undefined, [group], variant, value)
  }
}

// Theme tokens → { day, night } per variant.
seedFolded(foldDimensions(themeTokensData as unknown as Record<string, Record<string, Record<string, string>>>))

// Breakpoint tokens → { phone, tablet, laptop, desktop } per variant.
seedFolded(foldDimensions(breakpointTokensData as unknown as Record<string, Record<string, Record<string, string>>>))

// Inverse tokens are keyed group → theme → variant; reorder to theme → group → variant, then fold.
const inverseByTheme: Record<string, Record<string, Record<string, string>>> = {}
for (const [group, themes] of Object.entries(inverseTokensData)) {
  for (const [theme, variants] of Object.entries(themes)) {
    inverseByTheme[theme] ??= {}
    inverseByTheme[theme][group] = variants
  }
}
seedFolded(foldDimensions(inverseByTheme), true)

// Component token trees.
for (const [prefix, tree] of Object.entries(componentTokensData)) {
  seedComponentTree(prefix, tree, [])
}

export { registry } from './createRegistry.js'
export type { TokenEntry, TokenValue } from './createRegistry.js'
export { registerTokens } from './registerTokens.js'
