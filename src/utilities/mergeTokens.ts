/**
 * Deep-merges token overrides into a base token map.
 *
 * Additive only — omitting a group or item does NOT delete it.
 * Only the specified items are copied/overridden.
 */

import type { TokenMap } from './separateTokens.js'

export function mergeTokens(base: TokenMap, overrides: TokenMap): TokenMap {
  const result: TokenMap = {}

  // Copy base
  for (const group of Object.keys(base)) {
    result[group] = { ...base[group] }
  }

  // Merge overrides
  for (const group of Object.keys(overrides)) {
    if (!result[group]) {
      result[group] = {}
    }
    for (const item of Object.keys(overrides[group])) {
      result[group][item] = overrides[group][item]
    }
  }

  return result
}