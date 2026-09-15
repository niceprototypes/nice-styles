import { getConstantKey } from '../services/getConstant.js'
import { registry, type TokenValue } from './createRegistry.js'

/**
 * Write tokens into the registry's runtime layer.
 *
 * Each variant is keyed by its CSS variable name, so an override of a
 * generated token (core or component) lands on the same entry as its seed and
 * layers over it; a new name creates a runtime-only entry. Entries are never
 * replaced wholesale — the seed survives, and readers fall back to it for any
 * theme or breakpoint the override does not cover.
 *
 * @param tokenMap - `{ group: { variant: value } }`; values may be plain, theme, or breakpoint values
 * @param prefix - Component prefix (e.g. "button"); omit for core and custom tokens
 */
export function registerTokens(
  tokenMap: Record<string, Record<string, TokenValue>>,
  prefix?: string
): void {
  for (const [group, variants] of Object.entries(tokenMap)) {
    for (const [variant, value] of Object.entries(variants)) {
      const key = getConstantKey(group, variant, { pkg: prefix })
      const existing = registry.get(key)
      if (existing) {
        existing.runtime = value
      } else {
        registry.set(key, { key, prefix, path: [group], variant, inverse: false, runtime: value })
      }
    }
  }
}
