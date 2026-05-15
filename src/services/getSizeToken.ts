/**
 * Size (breakpoint) token getters.
 *
 * Convenience wrappers around getToken with breakpoint pre-filled. Three
 * sibling functions return the three accessor forms.
 *
 * @example
 * import { getSizeToken, BREAKPOINT_TABLET } from "nice-styles"
 *
 * getSizeToken("fontSize", "large", BREAKPOINT_TABLET)
 * // → "var(--np--font-size--large)"
 *
 * @example
 * getSizeTokenValue("fontSize", "large", BREAKPOINT_TABLET)
 * // → "28px"
 */

import { getToken, getTokenKey, getTokenValue } from './getToken.js'
import { BREAKPOINT_PHONE } from '../constants/breakpoints.js'

/** Returns the `var(--np--…)` reference for a size token. */
export function getSizeToken(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): string {
  return getToken(group, item, { breakpoint })
}

/** Returns the bare CSS variable name for a size token. */
export function getSizeTokenKey(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): string {
  return getTokenKey(group, item, { breakpoint })
}

/** Returns the raw size value (e.g. `"16px"`). */
export function getSizeTokenValue(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): string {
  return getTokenValue(group, item, { breakpoint })
}
