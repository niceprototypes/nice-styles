import type { TokenMap } from '../separateTokens.js'
import { parseValue } from './parseValue.js'
import { resolveReference } from './resolveReference.js'

/**
 * Match token references inside an expression: word.word (e.g., `gap.base`, `fontSize.large`).
 */
const TOKEN_REF_PATTERN = /([a-zA-Z]\w*)\.([a-zA-Z]\w*)/g

/**
 * Allow-list for the arithmetic body after token substitution.
 * Anything outside this set is rejected as a safety guard before the eval.
 */
const SAFE_ARITHMETIC_PATTERN = /^[\d\s.+\-*/()]+$/

/**
 * Strip the leading `= ` marker from a derived expression.
 */
function stripDerivedMarker(expression: string): string {
  return expression.slice(1).trim()
}

/**
 * Substitute every `group.item` reference in the expression with its numeric
 * value. Captures the unit from the first reference so the final result can
 * be re-suffixed with the right CSS unit.
 *
 * Returns the numeric-only expression and the unit string (empty when none).
 */
function substituteReferences(
  expression: string,
  staticTokens: TokenMap
): { numericExpression: string; unit: string } {
  let unit = ''
  let firstRef = true

  const numericExpression = expression.replace(TOKEN_REF_PATTERN, (_match, group, item) => {
    const rawValue = resolveReference(`${group}.${item}`, staticTokens)
    const [num, valueUnit] = parseValue(rawValue)
    if (firstRef && valueUnit) {
      unit = valueUnit
      firstRef = false
    }
    return String(num)
  })

  return { numericExpression, unit }
}

/**
 * Reject the substituted expression if it contains anything beyond digits,
 * decimal points, whitespace, and arithmetic operators. This is the safety
 * guard standing between the input and Function-eval below.
 */
function assertSafeArithmetic(numericExpression: string): void {
  if (SAFE_ARITHMETIC_PATTERN.test(numericExpression)) return
  throw new Error(`Invalid expression after resolution: "${numericExpression}"`)
}

/**
 * Evaluate the arithmetic body. Wrapped in `"use strict"` so any leak from
 * the host scope is rejected. The caller is responsible for assertSafeArithmetic.
 */
function evaluateArithmetic(numericExpression: string, originalExpression: string): number {
  const result = Function(`"use strict"; return (${numericExpression})`)()
  if (typeof result !== 'number' || isNaN(result)) {
    throw new Error(`Expression "${originalExpression}" did not evaluate to a number.`)
  }
  return result
}

/**
 * Evaluates a derived expression against the static token map.
 *
 * Supports: token references (`group.item`), arithmetic (`*`, `+`, `-`, `/`),
 * parentheses. All referenced values must be numeric with compatible units;
 * the result inherits the unit from the first resolved reference.
 */
export function evaluateExpression(expression: string, staticTokens: TokenMap): string {
  const body = stripDerivedMarker(expression)
  const { numericExpression, unit } = substituteReferences(body, staticTokens)
  assertSafeArithmetic(numericExpression)
  const result = evaluateArithmetic(numericExpression, expression)
  return `${result}${unit}`
}
