import { camelToKebab } from '../utilities/camelToKebab.js'

/**
 * Universal namespace prefix for all Nice Prototypes CSS custom properties
 */
export const NAMESPACE = "np"

/**
 * Options for getConstant / getConstantKey
 */
export interface CssConstantOptions {
  /** Theme suffix (e.g., "day", "night"). Appends --{theme} to the key. */
  theme?: string
  /** Responsive breakpoint suffix (e.g., "small", "large"). Appends --{breakpoint} to the key. Mutually exclusive with theme — breakpoint takes precedence when both are provided. */
  breakpoint?: string
  /** Component prefix (e.g., "button", "icon"). Omit for base tokens. */
  pkg?: string
  /** Inverse-color flag. Appends a separate `--inverse` segment last (after any theme/breakpoint), e.g. `--np--color--night--inverse`. */
  inverse?: boolean
}

/**
 * Builds the bare CSS variable name for a Nice token, following the pattern
 * `--np--{token}--{param}` for non-base tokens (`--np--{token}` when `param` is
 * the implicit `base` default) and `--np--{pkg}--{token}--{param}` for component
 * tokens, with optional `--{theme}` or `--{breakpoint}` suffix.
 *
 * Internal helper — both `getConstant` and `getConstantKey` build the same
 * key, they just differ in whether they wrap it in `var(...)`.
 */
function buildKey(
  token: string,
  param: string,
  options?: CssConstantOptions
): string {
  const { theme, breakpoint, pkg, inverse } = options ?? {}
  // Breakpoint takes precedence over theme — they are mutually exclusive suffixes
  const suffix = breakpoint ? `--${breakpoint}` : theme ? `--${theme}` : ''
  // Inverse is a separate trailing segment, kept distinct from the theme.
  const inverseSuffix = inverse ? '--inverse' : ''
  // `base` is the implicit default and carries no segment in the variable name:
  // `--np--color` for base, `--np--color--night` for base+theme. Non-base
  // variants read normally — `--np--color--light`.
  const variant = camelToKebab(param) === 'base' ? '' : `--${camelToKebab(param)}`
  return pkg
    ? `--${NAMESPACE}--${pkg}--${camelToKebab(token)}${variant}${suffix}${inverseSuffix}`
    : `--${NAMESPACE}--${camelToKebab(token)}${variant}${suffix}${inverseSuffix}`
}

/**
 * Returns the `var(--np--…)` reference string for a Nice token.
 *
 * Mirrors the `getToken` / `getTokenKey` / `getTokenValue` getter pattern —
 * the common case (CSS variable reference) is the bare return, the bare key
 * is the sibling `getConstantKey`.
 *
 * @example
 * // Base tokens (the `base` default is segment-less)
 * getConstant("color", "base")
 * // "var(--np--color)"
 *
 * @example
 * // Force day theme
 * getConstant("backgroundColor", "base", { theme: "day" })
 * // "var(--np--background-color--day)"
 *
 * @example
 * // Breakpoint primitive
 * getConstant("fontSize", "large", { breakpoint: "phone" })
 * // "var(--np--font-size--large--phone)"
 *
 * @example
 * // Component tokens
 * getConstant("height", "small", { pkg: "button" })
 * // "var(--np--button--height--small)"
 */
export function getConstant(
  token: string,
  param: string,
  options?: CssConstantOptions
): string {
  return `var(${buildKey(token, param, options)})`
}

/**
 * Returns the bare CSS variable name (no `var(...)` wrapper) for a Nice token.
 *
 * Use this when declaring a custom property (left-hand side of a `:` in CSS)
 * or when composing a `var(...)` reference manually. For reading a token (the
 * common case), use `getConstant` instead.
 *
 * @example
 * getConstantKey("color", "base")
 * // "--np--color"
 *
 * @example
 * getConstantKey("fontSize", "large", { breakpoint: "phone" })
 * // "--np--font-size--large--phone"
 */
export function getConstantKey(
  token: string,
  param: string,
  options?: CssConstantOptions
): string {
  return buildKey(token, param, options)
}