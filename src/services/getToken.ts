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
 * Get design token with CSS variable name and raw value
 *
 * Returns an object with three properties:
 * - `key`: CSS variable name without var() wrapper (e.g., "--font-size-base")
 * - `var`: CSS variable with var() wrapper (e.g., "var(--font-size-base)")
 * - `value`: Raw token value (e.g., "16px")
 *
 * @param group - Token group name (e.g., "fontSize", "foregroundColor")
 * @param item - Optional item name within the group (defaults to "base")
 * @returns Object containing key, var, and value properties
 * @throws Error if token group or item not found
 *
 * @example
 * // Get CSS variable name
 * getToken("fontSize").key // "--font-size-base"
 * getToken("fontSize", "large").key // "--font-size-large"
 *
 * @example
 * // Get CSS variable with var() wrapper
 * getToken("fontSize").var // "var(--font-size-base)"
 * getToken("fontSize", "large").var // "var(--font-size-large)"
 *
 * @example
 * // Get raw token value
 * getToken("fontSize").value // "16px"
 * getToken("fontSize", "large").value // "24px"
 */
export function getToken(group: keyof typeof tokens): TokenResult
export function getToken(group: keyof typeof tokens, item: string): TokenResult
export function getToken(
  group: keyof typeof tokens,
  item?: string
): TokenResult {
  // Retrieve the token group from the tokens JSON
  const tokenGroup = tokens[group]
  if (!tokenGroup) {
    throw new Error(`Token group "${group}" not found`)
  }

  // Default to "base" item if not specified
  const targetItem = item ?? 'base'

  // Get the raw value from the token group's items
  const value = tokenGroup.items[targetItem as keyof typeof tokenGroup.items]
  if (value === undefined) {
    throw new Error(`Token item "${targetItem}" not found in group "${group}"`)
  }

  // Build the CSS variable name using the token group's name property and kebab-cased item name
  const key = `--${tokenGroup.name}-${camelToKebab(targetItem)}`

  // Return object with three properties:
  // - key: CSS variable name without var() wrapper
  // - var: CSS variable with var() wrapper
  // - value: raw token value
  return {
    key,
    var: `var(${key})`,
    value: String(value),
  }
}