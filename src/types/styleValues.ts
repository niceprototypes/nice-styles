/**
 * Style-value object shapes used by the token registry.
 *
 * `ModeValue` and `BreakpointValue` are how `createTokens` consumers describe
 * a variant whose value differs across modes (day/night) or breakpoints
 * (phone/tablet/laptop/desktop). The default key (`day` / `phone`) is the base
 * value; non-default keys generate `@media` overrides.
 */

/**
 * Value with mode variants (day/night theming).
 * Must include DEFAULT_MODE key, additional modes are optional.
 */
export interface ModeValue {
  [mode: string]: string | number
}

/**
 * Value with breakpoint variants (responsive sizing).
 * Must include DEFAULT_BREAKPOINT key, additional breakpoints are optional.
 * Mutually exclusive with ModeValue on the same token variant.
 */
export interface BreakpointValue {
  [breakpoint: string]: string | number
}
