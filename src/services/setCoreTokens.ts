/**
 * Batch setter for core token overrides.
 *
 * Merges the provided overrides into the core module and reprocesses.
 * Omitted groups and items are preserved — this is additive, not destructive.
 *
 * @param tokens - Override map: { group: { item: value } }
 *
 * @example
 * setCoreTokens({
 *   gap: { base: "20px" },
 *   fontSize: { large: "28px" }
 * })
 */

import { setModuleOverrides } from '../store.js'
import type { TokenMap } from '../engine/separateTokens.js'

export function setCoreTokens(tokens: TokenMap): void {
  setModuleOverrides('core', { base: tokens })
}