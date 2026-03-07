/**
 * Token processing orchestrator.
 *
 * Runs the pipeline: separate → replace → derive
 *
 * 1. Separate source tokens into static and derived
 * 2. Validate and merge consumer overrides into static
 * 3. Resolve derived expressions using the updated static values
 * 4. Merge derived results into the final token map
 */

import type { TokenMap } from './separateTokens.js'
import { separateTokens } from './separateTokens.js'
import { mergeTokens } from './mergeTokens.js'
import { validateOverrides } from './validateOverrides.js'
import { resolveDerived } from './resolveDerived.js'

export function processTokens(
  sourceTokens: TokenMap,
  overrides?: TokenMap
): TokenMap {
  // 1. Separate static from derived
  const { static: staticTokens, derived } = separateTokens(sourceTokens)

  // 2. Validate and merge consumer overrides
  let processed = staticTokens
  if (overrides && Object.keys(overrides).length > 0) {
    validateOverrides(overrides)
    processed = mergeTokens(processed, overrides)
  }

  // 3. Resolve derived expressions
  if (Object.keys(derived).length > 0) {
    const resolvedDerived = resolveDerived(derived, processed)
    processed = mergeTokens(processed, resolvedDerived)
  }

  return processed
}