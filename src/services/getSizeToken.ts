/**
 * Convenience getter for size (breakpoint) tokens.
 *
 * Delegates to getCoreToken with the breakpoint in config.
 *
 * @param group - Token group name (e.g., "fontSize", "gap")
 * @param item - Item name within the group (defaults to "base")
 * @param breakpoint - Responsive breakpoint (defaults to BREAKPOINT_PHONE)
 * @returns Object containing key, var, and value properties
 *
 * @example
 * import { getSizeToken, BREAKPOINT_TABLET } from "nice-styles"
 *
 * getSizeToken("fontSize", "large", BREAKPOINT_TABLET).value
 * // → "28px"
 */

import { getCoreToken, type TokenResult } from './getCoreToken.js'
import { BREAKPOINT_PHONE } from '../constants/breakpoints.js'

export function getSizeToken(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): TokenResult {
  return getCoreToken(group, item, { breakpoint })
}