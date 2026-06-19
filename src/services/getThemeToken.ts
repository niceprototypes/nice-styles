/**
 * Theme token getters.
 *
 * Convenience wrappers around getToken with theme pre-filled (default "day").
 * The group name is positional; variant / theme go in an options object.
 *
 * @example
 * getThemeToken("color", { variant: "base", theme: "night" })
 * // → "var(--np--color--base--night)"
 *
 * @example
 * getThemeTokenValue("color", { variant: "base", theme: "night" })
 * // → "hsla(210, 5%, 95%, 1)"
 */

import { getToken, getTokenKey, getTokenValue } from './getToken.js'

export interface ThemeTokenOptions {
  variant?: string
  theme?: string
}

/** Returns the `var(--np--…)` reference for a theme-dimensioned token. */
export function getThemeToken(group: string, { variant = 'base', theme = 'day' }: ThemeTokenOptions = {}): string {
  return getToken(group, { variant, theme })
}

/** Returns the bare CSS variable name for a theme-dimensioned token. */
export function getThemeTokenKey(group: string, { variant = 'base', theme = 'day' }: ThemeTokenOptions = {}): string {
  return getTokenKey(group, { variant, theme })
}

/** Returns the raw value (e.g. an hsla string) for a theme-dimensioned token. */
export function getThemeTokenValue(group: string, { variant = 'base', theme = 'day' }: ThemeTokenOptions = {}): string {
  return getTokenValue(group, { variant, theme })
}
