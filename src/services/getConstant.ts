import { camelToKebab } from '../utilities/camelToKebab.js'

/**
 * Universal namespace prefix for all Nice Prototypes CSS custom properties
 */
export const NAMESPACE = "np"

/**
 * Options for getConstant / getConstantKey
 */
export interface CssConstantOptions {
  /** Theme mode suffix (e.g., "day", "night"). Appends --{mode} to the key. */
  mode?: string
  /** Responsive breakpoint suffix (e.g., "small", "large"). Appends --{breakpoint} to the key. Mutually exclusive with mode — breakpoint takes precedence when both are provided. */
  breakpoint?: string
  /** Component prefix (e.g., "button", "icon"). Omit for base tokens. */
  pkg?: string
}

/**
 * Builds the bare CSS variable name for a Nice token, following the pattern
 * `--np--{token}--{param}` for base tokens and
 * `--np--{pkg}--{token}--{param}` for component tokens, with optional
 * `--{mode}` or `--{breakpoint}` suffix.
 *
 * Internal helper — both `getConstant` and `getConstantKey` build the same
 * key, they just differ in whether they wrap it in `var(...)`.
 */
function buildKey(
  token: string,
  param: string,
  options?: CssConstantOptions
): string {
  const { mode, breakpoint, pkg } = options ?? {}
  // Breakpoint takes precedence over mode — they are mutually exclusive suffixes
  const suffix = breakpoint ? `--${breakpoint}` : mode ? `--${mode}` : ''
  return pkg
    ? `--${NAMESPACE}--${pkg}--${camelToKebab(token)}--${camelToKebab(param)}${suffix}`
    : `--${NAMESPACE}--${camelToKebab(token)}--${camelToKebab(param)}${suffix}`
}

/**
 * Returns the `var(--np--…)` reference string for a Nice token.
 *
 * Mirrors the `getToken` / `getTokenKey` / `getTokenValue` getter pattern —
 * the common case (CSS variable reference) is the bare return, the bare key
 * is the sibling `getConstantKey`.
 *
 * @example
 * // Base tokens
 * getConstant("color", "base")
 * // "var(--np--color--base)"
 *
 * @example
 * // Force day mode
 * getConstant("backgroundColor", "base", { mode: "day" })
 * // "var(--np--background-color--base--day)"
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
 * // "--np--color--base"
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
