import tokens from '../tokens.json' with { type: 'json' }
import { getTokenFromMap, type TokenResult } from './getTokenFromMap.js'

/**
 * Get design token with CSS variable name and raw value
 *
 * Returns an object with three properties:
 * - `key`: CSS variable name without var() wrapper (e.g., "--core--font-size--base")
 * - `var`: CSS variable with var() wrapper (e.g., "var(--core--font-size--base)")
 * - `value`: Raw token value (e.g., "16px")
 *
 * @param group - Token group name (e.g., "fontSize", "foregroundColor")
 * @param item - Optional item name within the group (defaults to "base")
 * @returns Object containing key, var, and value properties
 * @throws Error if token group or item not found
 *
 * @example
 * // Get CSS variable name
 * getToken("fontSize").key // "--core--font-size--base"
 * getToken("fontSize", "large").key // "--core--font-size--large"
 *
 * @example
 * // Get CSS variable with var() wrapper
 * getToken("fontSize").var // "var(--core--font-size--base)"
 * getToken("fontSize", "large").var // "var(--core--font-size--large)"
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
  return getTokenFromMap("core", tokens, group, item)
}