/**
 * Convenience getter for color (mode) tokens.
 *
 * Delegates to getToken with the mode in config.
 *
 * @param group - Token group name (e.g., "foregroundColor", "backgroundColor")
 * @param item - Item name within the group (defaults to "base")
 * @param mode - Theme mode (defaults to "day")
 * @returns Object containing key, var, and value properties
 *
 * @example
 * getColorToken("foregroundColor", "base", "night").value
 * // → "hsla(210, 5%, 95%, 1)"
 */

import { getToken, type TokenResult } from './getToken.js'

export function getColorToken(
  group: string,
  item: string = 'base',
  mode: string = 'day'
): TokenResult {
  return getToken(group, item, { mode })
}