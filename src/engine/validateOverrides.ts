/**
 * Validates consumer-provided token overrides against the current token map.
 *
 * Rules:
 * - New group → allowed (creation, not a true override)
 * - New item in existing group → allowed (addition, not a true override)
 * - Existing item → allowed (true override)
 * - Derived expressions ("= ...") in overrides → error (overrides must be static)
 */

import type { TokenMap } from './separateTokens.js'

export function validateOverrides(overrides: TokenMap): void {
  for (const group of Object.keys(overrides)) {
    const items = overrides[group]
    for (const item of Object.keys(items)) {
      const value = items[item]
      if (value.startsWith('=')) {
        throw new Error(
          `Override "${group}.${item}" cannot be a derived expression. Overrides must be static values.`
        )
      }
    }
  }
}