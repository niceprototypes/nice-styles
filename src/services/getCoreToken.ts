import tokens from '../generated/tokensData.js'
import { getTokenFromMap, type TokenResult } from '../utilities/getTokenFromMap.js'

/**
 * Get a core design token with CSS variable name and raw value
 *
 * Accesses only the static core tokens defined in nice-styles JSON.
 * For runtime tokens (including app-level custom tokens registered
 * via createTokens), use getToken from nice-react-styles instead.
 *
 * Returns an object with three properties:
 * - `key`: CSS variable name without var() wrapper (e.g., "--np--font-size--base")
 * - `var`: CSS variable with var() wrapper (e.g., "var(--np--font-size--base)")
 * - `value`: Raw token value (e.g., "16px")
 *
 * @param group - Token group name (e.g., "fontSize", "foregroundColor")
 * @param item - Optional item name within the group (defaults to "base")
 * @param mode - Optional theme mode (e.g., "night"). Returns mode-specific CSS variable.
 * @returns Object containing key, var, and value properties
 * @throws Error if token group or item not found
 *
 * @example
 * // Get semantic token (auto-switches with theme)
 * getCoreToken("foregroundColor", "base").var
 * // → "var(--np--foreground-color--base)"
 *
 * @example
 * // Get explicit night mode token
 * getCoreToken("foregroundColor", "base", "night").var
 * // → "var(--np--foreground-color--base--night)"
 *
 * @example
 * // Use in styled-components for always-dark section
 * const DarkCard = styled.div`
 *   background: ${getCoreToken("backgroundColor", "base", "night").var};
 *   color: ${getCoreToken("foregroundColor", "base", "night").var};
 * `
 */
export function getCoreToken(group: keyof typeof tokens): TokenResult
export function getCoreToken(group: keyof typeof tokens, item: string): TokenResult
export function getCoreToken(group: keyof typeof tokens, item: string, mode: string): TokenResult
export function getCoreToken(
  group: keyof typeof tokens,
  item?: string,
  mode?: string
): TokenResult {
  return getTokenFromMap(tokens, group, item, { mode })
}