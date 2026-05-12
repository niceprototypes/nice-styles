/**
 * Resolves derived token expressions against a static token map.
 *
 * Derived values are prefixed with "=" and can reference other tokens
 * using "group.item" syntax, with basic arithmetic (* + - /).
 *
 * Example: "= gap.base * 3"
 *   gap.base = "16px" → numeric 16 → 16 * 3 = 48 → "48px"
 *
 * The result is always a static value with the unit from the first
 * resolved reference.
 */

import type { TokenMap } from '../separateTokens.js'
import { evaluateExpression } from './evaluateExpression.js'

/**
 * Resolves all derived tokens to static values.
 * Each value is evaluated independently; throws on the first failure.
 */
export function resolveDerived(derived: TokenMap, staticTokens: TokenMap): TokenMap {
  const resolved: TokenMap = {}

  for (const group of Object.keys(derived)) {
    resolved[group] = {}
    for (const item of Object.keys(derived[group])) {
      const expression = derived[group][item]
      resolved[group][item] = evaluateExpression(expression, staticTokens)
    }
  }

  return resolved
}
