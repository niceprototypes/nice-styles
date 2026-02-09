import tokens from '../tokensData.js'
import { getTokenFromMap, type TokenResult } from './getTokenFromMap.js'

/**
 * Get design token with CSS variable name and raw value
 *
 * Returns an object with three properties:
 * - `key`: CSS variable name without var() wrapper (e.g., "--np--font-size--base")
 * - `var`: CSS variable with var() wrapper (e.g., "var(--np--font-size--base)")
 * - `value`: Raw token value (e.g., "16px")
 *
 * @param group - Token group name (e.g., "fontSize", "foregroundColor")
 * @param item - Optional item name within the group (defaults to "base")
 * @param mode - Optional theme mode (e.g., "dark"). Returns mode-specific CSS variable.
 * @returns Object containing key, var, and value properties
 * @throws Error if token group or item not found
 *
 * @example
 * // Get semantic token (auto-switches with theme)
 * getToken("foregroundColor", "base").var
 * // → "var(--np--foreground-color--base)"
 *
 * @example
 * // Get explicit dark mode token
 * getToken("foregroundColor", "base", "dark").var
 * // → "var(--np--foreground-color--base--dark)"
 *
 * @example
 * // Use in styled-components for always-dark section
 * const DarkCard = styled.div`
 *   background: ${getToken("backgroundColor", "base", "dark").var};
 *   color: ${getToken("foregroundColor", "base", "dark").var};
 * `
 */
export function getToken(group: keyof typeof tokens): TokenResult
export function getToken(group: keyof typeof tokens, item: string): TokenResult
export function getToken(group: keyof typeof tokens, item: string, mode: string): TokenResult
export function getToken(
  group: keyof typeof tokens,
  item?: string,
  mode?: string
): TokenResult {
  return getTokenFromMap(tokens, group, item, { mode })
}
