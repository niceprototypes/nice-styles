import tokens from '../tokens.json' with { type: 'json' }
import { camelToKebab } from '../utilities/camelToKebab.js'

/**
 * Result object returned by getToken when item is specified
 */
interface TokenResult {
  /**
   * The CSS variable name without var() wrapper
   */
  key: string

  /**
   * The CSS variable with var() wrapper
   */
  var: string

  /**
   * The raw token value
   */
  value: string
}

/**
 * Get token with multiple access patterns
 *
 * @example
 * // Get CSS variable name (defaults to "base")
 * getToken("fontSize").toString() // "--font-size-base"
 * getToken("fontSize", "base").toString() // "--font-size-base"
 * getToken("fontSize", "large").toString() // "--font-size-large"
 *
 * @example
 * // Get CSS variable with var() wrapper
 * getToken("fontSize").var() // "var(--font-size-base)"
 * getToken("fontSize", "large").var() // "var(--font-size-large)"
 *
 * @example
 * // Get raw value
 * getToken("fontSize").var(true) // "16px"
 * getToken("fontSize", "large").var(true) // "24px"
 */
export function getToken(group: keyof typeof tokens): TokenResult
export function getToken(group: keyof typeof tokens, item: string): TokenResult
export function getToken(
  group: keyof typeof tokens,
  item?: string
): TokenResult {
  const tokenGroup = tokens[group]
  if (!tokenGroup) {
    throw new Error(`Token group "${group}" not found`)
  }

  const targetItem = item ?? 'base'

  const value = tokenGroup.items[targetItem as keyof typeof tokenGroup.items]
  if (value === undefined) {
    throw new Error(`Token item "${targetItem}" not found in group "${group}"`)
  }

  const key = `--${tokenGroup.name}-${camelToKebab(targetItem)}`

  return {
    key,
    var: `var(${key})`,
    value: String(value),
  }
}