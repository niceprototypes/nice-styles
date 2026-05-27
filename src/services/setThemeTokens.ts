/**
 * Batch setter for themes module (theme) token overrides.
 *
 * Merges the provided overrides into the themes module and reprocesses.
 * Each key is a theme name ("day", "night") mapping to token groups.
 *
 * @param tokens - Override map: { theme: { group: { item: value } } }
 *
 * @example
 * setThemeTokens({
 *   night: {
 *     backgroundColor: { base: "hsla(0, 0%, 0%, 1)" }
 *   }
 * })
 */

import { setModuleOverrides } from '../store.js'
import type { DimensionMap } from '../store.js'

export function setThemeTokens(tokens: DimensionMap): void {
  setModuleOverrides('color', tokens)
}
