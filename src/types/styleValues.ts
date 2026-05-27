/**
 * Style-value object shapes used by the token registry.
 *
 * `ThemeValue` and `BreakpointValue` are how `createTokens` consumers describe
 * a variant whose value differs across themes (day/night) or breakpoints
 * (phone/tablet/laptop/desktop). The default key (`day` / `phone`) is the base
 * value; non-default keys generate `@media` overrides.
 */

/**
 * Value with theme variants (day/night theming).
 * Must include DEFAULT_THEME key, additional themes are optional.
 */
export interface ThemeValue {
  [theme: string]: string | number
}

/**
 * Value with breakpoint variants (responsive sizing).
 * Must include DEFAULT_BREAKPOINT key, additional breakpoints are optional.
 * Mutually exclusive with ThemeValue on the same token variant.
 */
export interface BreakpointValue {
  [breakpoint: string]: string | number
}
