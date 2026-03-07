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

import type { TokenMap } from './separateTokens.js'

/**
 * Extracts numeric value and unit from a CSS value string.
 * Returns [number, unit] or throws if not parseable.
 */
function parseValue(value: string): [number, string] {
  const match = value.match(/^(-?[\d.]+)\s*(.*)$/)
  if (!match) {
    throw new Error(`Cannot parse numeric value from "${value}"`)
  }
  return [parseFloat(match[1]), match[2]]
}

/**
 * Resolves a single token reference ("group.item") from the static map.
 */
function resolveReference(ref: string, staticTokens: TokenMap): string {
  const parts = ref.split('.')
  if (parts.length !== 2) {
    throw new Error(`Invalid token reference "${ref}". Expected "group.item" format.`)
  }
  const [group, item] = parts
  const groupTokens = staticTokens[group]
  if (!groupTokens) {
    throw new Error(`Derived token references unknown group "${group}".`)
  }
  const value = groupTokens[item]
  if (value === undefined) {
    throw new Error(`Derived token references unknown item "${group}.${item}".`)
  }
  return value
}

/**
 * Evaluates a derived expression against static tokens.
 *
 * Supports: token references (group.item), arithmetic (*, +, -, /), parentheses.
 * All referenced values must be numeric with compatible units.
 */
function evaluateExpression(expression: string, staticTokens: TokenMap): string {
  // Remove the "= " prefix
  const expr = expression.slice(1).trim()

  // Replace all token references with their numeric values
  // Token refs match: word.word (e.g., gap.base, fontSize.large)
  let unit = ''
  let firstRef = true

  const resolved = expr.replace(/([a-zA-Z]\w*)\.([a-zA-Z]\w*)/g, (_match, group, item) => {
    const value = resolveReference(`${group}.${item}`, staticTokens)
    const [num, valueUnit] = parseValue(value)
    if (firstRef && valueUnit) {
      unit = valueUnit
      firstRef = false
    }
    return String(num)
  })

  // Evaluate the arithmetic expression safely
  // Only allow: digits, decimal points, spaces, and arithmetic operators
  if (!/^[\d\s.+\-*/()]+$/.test(resolved)) {
    throw new Error(`Invalid expression after resolution: "${resolved}"`)
  }

  const result = Function(`"use strict"; return (${resolved})`)()

  if (typeof result !== 'number' || isNaN(result)) {
    throw new Error(`Expression "${expression}" did not evaluate to a number.`)
  }

  return `${result}${unit}`
}

/**
 * Resolves all derived tokens to static values.
 * Validates that all references exist in the static map before computing.
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