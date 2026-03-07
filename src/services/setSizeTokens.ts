/**
 * Batch setter for size module (breakpoint) token overrides.
 *
 * Merges the provided overrides into the size module and reprocesses.
 * Each key is a breakpoint name ("mobile", "tablet", "desktop") mapping to token groups.
 *
 * @param tokens - Override map: { breakpoint: { group: { item: value } } }
 *
 * @example
 * setSizeTokens({
 *   tablet: {
 *     fontSize: { large: "28px" }
 *   },
 *   desktop: {
 *     fontSize: { large: "32px", larger: "40px" }
 *   }
 * })
 */

import { setModuleOverrides } from '../store.js'
import type { DimensionMap } from '../store.js'

export function setSizeTokens(tokens: DimensionMap): void {
  setModuleOverrides('size', tokens)
}