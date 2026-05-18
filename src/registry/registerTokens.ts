import type { TokenMap } from '../utilities/getTokenFromMap.js'
import type { ModeValue } from '../types/styleValues.js'
import { DEFAULT_MODE } from '../constants/styleValues.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { registry } from './createRegistry.js'

/**
 * Register tokens into the unified registry.
 *
 * Supports two value formats:
 * - Simple value: `{ base: "16px" }` (default mode only)
 * - Mode value: `{ base: { day: "16px", night: "18px" } }`
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Optional component prefix for CSS variables (e.g., "button", "tile")
 */
export function registerTokens(
  tokenMap: TokenMap | Record<string, Record<string, string | number | ModeValue>>,
  prefix?: string
): void {
  for (const [name, variants] of Object.entries(tokenMap)) {
    const existing = registry.get(name)
    const modes = new Set<string>([DEFAULT_MODE])

    for (const value of Object.values(variants)) {
      if (isStyleValue("mode", value)) {
        for (const mode of Object.keys(value)) {
          modes.add(mode)
        }
      }
    }

    let mergedVariants: Record<string, string | number | ModeValue>

    if (existing) {
      mergedVariants = { ...existing.variants, ...variants }
      for (const mode of existing.modes) {
        modes.add(mode)
      }
    } else {
      mergedVariants = variants
    }

    registry.set(name, { prefix, variants: mergedVariants, modes })
  }
}
