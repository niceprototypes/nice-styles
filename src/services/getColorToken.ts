/**
 * Color (mode) token getters.
 *
 * Convenience wrappers around getToken with mode pre-filled. Three sibling
 * functions return the three accessor forms.
 *
 * @example
 * getColorToken("foregroundColor", "base", "night")
 * // → "var(--np--foreground-color--base--night)"
 *
 * @example
 * getColorTokenValue("foregroundColor", "base", "night")
 * // → "hsla(210, 5%, 95%, 1)"
 */

import { getToken, getTokenKey, getTokenValue } from './getToken.js'

/** Returns the `var(--np--…)` reference for a color token. */
export function getColorToken(
  group: string,
  item: string = 'base',
  mode: string = 'day'
): string {
  return getToken(group, item, { mode })
}

/** Returns the bare CSS variable name for a color token. */
export function getColorTokenKey(
  group: string,
  item: string = 'base',
  mode: string = 'day'
): string {
  return getTokenKey(group, item, { mode })
}

/** Returns the raw color value (e.g. an hsla string). */
export function getColorTokenValue(
  group: string,
  item: string = 'base',
  mode: string = 'day'
): string {
  return getTokenValue(group, item, { mode })
}
