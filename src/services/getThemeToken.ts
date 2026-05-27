/**
 * Theme token getters.
 *
 * Convenience wrappers around getToken with theme pre-filled. Three sibling
 * functions return the three accessor forms.
 *
 * @example
 * getThemeToken("color", "base", "night")
 * // → "var(--np--color--base--night)"
 *
 * @example
 * getThemeTokenValue("color", "base", "night")
 * // → "hsla(210, 5%, 95%, 1)"
 */

import { getToken, getTokenKey, getTokenValue } from './getToken.js'

/** Returns the `var(--np--…)` reference for a theme-dimensioned token. */
export function getThemeToken(
  group: string,
  item: string = 'base',
  theme: string = 'day'
): string {
  return getToken(group, item, theme)
}

/** Returns the bare CSS variable name for a theme-dimensioned token. */
export function getThemeTokenKey(
  group: string,
  item: string = 'base',
  theme: string = 'day'
): string {
  return getTokenKey(group, item, theme)
}

/** Returns the raw value (e.g. an hsla string) for a theme-dimensioned token. */
export function getThemeTokenValue(
  group: string,
  item: string = 'base',
  theme: string = 'day'
): string {
  return getTokenValue(group, item, theme)
}