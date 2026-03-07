/**
 * Convenience getter for size (breakpoint) tokens.
 *
 * Delegates to getCoreToken with the breakpoint in config.
 *
 * @param group - Token group name (e.g., "fontSize", "gap")
 * @param item - Item name within the group (defaults to "base")
 * @param breakpoint - Responsive breakpoint (defaults to "mobile")
 * @returns Object containing key, var, and value properties
 *
 * @example
 * getSizeToken("fontSize", "large", "tablet").value
 * // → "28px"
 */

import { getCoreToken, type TokenResult } from './getCoreToken.js'

export function getSizeToken(
  group: string,
  item: string = 'base',
  breakpoint: string = 'mobile'
): TokenResult {
  return getCoreToken(group, item, { breakpoint })
}