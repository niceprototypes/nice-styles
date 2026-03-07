/**
 * Batch setter for color module (mode) token overrides.
 *
 * Merges the provided overrides into the color module and reprocesses.
 * Each key is a mode name ("day", "night") mapping to token groups.
 *
 * @param tokens - Override map: { mode: { group: { item: value } } }
 *
 * @example
 * setColorTokens({
 *   night: {
 *     backgroundColor: { base: "hsla(0, 0%, 0%, 1)" }
 *   }
 * })
 */

import { setModuleOverrides } from '../store.js'
import type { DimensionMap } from '../store.js'

export function setColorTokens(tokens: DimensionMap): void {
  setModuleOverrides('color', tokens)
}