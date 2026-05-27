import type { TokenMap } from '../utilities/getTokenFromMap.js'
import type { ThemeValue } from '../types/styleValues.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { registry } from './createRegistry.js'

/**
 * Register tokens into the unified registry.
 *
 * Supports two value formats:
 * - Simple value: `{ base: "16px" }` (default theme only)
 * - Theme value: `{ base: { day: "16px", night: "18px" } }`
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Optional component prefix for CSS variables (e.g., "button", "tile")
 */
export function registerTokens(
  tokenMap: TokenMap | Record<string, Record<string, string | number | ThemeValue>>,
  prefix?: string
): void {
  for (const [name, variants] of Object.entries(tokenMap)) {
    const existing = registry.get(name)
    const themes = new Set<string>([DEFAULT_THEME])

    for (const value of Object.values(variants)) {
      if (isStyleValue("theme", value)) {
        for (const theme of Object.keys(value)) {
          themes.add(theme)
        }
      }
    }

    let mergedVariants: Record<string, string | number | ThemeValue>

    if (existing) {
      mergedVariants = { ...existing.variants, ...variants }
      for (const theme of existing.themes) {
        themes.add(theme)
      }
    } else {
      mergedVariants = variants
    }

    registry.set(name, { prefix, variants: mergedVariants, themes })
  }
}