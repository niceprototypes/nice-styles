/**
 * Batch setter for breakpoints module (breakpoint) token overrides.
 *
 * Merges the provided overrides into the breakpoints module and reprocesses.
 * Each key is a breakpoint name ("phone", "tablet", "laptop") mapping to token groups.
 *
 * @param tokens - Override map: { breakpoint: { group: { item: value } } }
 *
 * @example
 * setBreakpointTokens({
 *   medium: {
 *     fontSize: { large: "28px" }
 *   },
 *   large: {
 *     fontSize: { large: "32px", larger: "40px" }
 *   }
 * })
 */

import { setModuleOverrides } from '../store.js'
import type { DimensionMap } from '../store.js'

export function setBreakpointTokens(tokens: DimensionMap): void {
  setModuleOverrides('size', tokens)
}