/**
 * Convenience getter for size (breakpoint) tokens.
 *
 * Delegates to getCoreToken with the breakpoint in config.
 *
 * @param group - Token group name (e.g., "fontSize", "gap")
 * @param item - Item name within the group (defaults to "base")
 * @param breakpoint - Responsive breakpoint (defaults to BREAKPOINT_SMALL)
 * @returns Object containing key, var, and value properties
 *
 * @example
 * import { getSizeToken, BREAKPOINT_MEDIUM } from "nice-styles"
 *
 * getSizeToken("fontSize", "large", BREAKPOINT_MEDIUM).value
 * // → "28px"
 */

import { getCoreToken, type TokenResult } from './getCoreToken.js'
import { BREAKPOINT_SMALL } from '../constants/breakpoints.js'

export function getSizeToken(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_SMALL
): TokenResult {
  return getCoreToken(group, item, { breakpoint })
}