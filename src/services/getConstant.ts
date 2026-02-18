import { camelToKebab } from '../utilities/camelToKebab.js'

/**
 * Universal namespace prefix for all Nice Prototypes CSS custom properties
 */
export const NAMESPACE = "np"

/**
 * Result object returned by getConstant
 */
export interface CssConstantResult {
  /**
   * The CSS variable name without var() wrapper
   */
  key: string

  /**
   * The CSS variable with var() wrapper
   */
  var: string
}

/**
 * Options for getConstant
 */
export interface CssConstantOptions {
  /** Theme mode suffix (e.g., "day", "night"). Appends --{mode} to the key. */
  mode?: string
  /** Component prefix (e.g., "button", "icon"). Omit for base tokens. */
  pkg?: string
}

/**
 * Creates a standardized CSS custom property name following the Nice pattern:
 * --np--{token}--{param} for base tokens, --np--{pkg}--{token}--{param} for
 * component tokens, with optional --{mode} suffix.
 *
 * Uses double dashes as segment delimiters, allowing single dashes
 * within segments for compound words. Accepts camelCase input and
 * automatically converts to kebab-case.
 *
 * @param token - Token name in camelCase (e.g., "foregroundColor", "statusPrimaryBase")
 * @param param - Parameter/variant name in camelCase (e.g., "base", "backgroundColor")
 * @param options - Optional mode and pkg
 * @returns Object with key and var properties
 *
 * @example
 * // Base tokens
 * getConstant("foregroundColor", "base")
 * // { key: "--np--foreground-color--base", var: "var(--np--foreground-color--base)" }
 *
 * @example
 * // Force day mode
 * getConstant("backgroundColor", "base", { mode: "day" })
 * // { key: "--np--background-color--base--day", var: "var(--np--background-color--base--day)" }
 *
 * @example
 * // Force dark mode
 * getConstant("foregroundColor", "base", { mode: "dark" })
 * // { key: "--np--foreground-color--base--dark", var: "var(--np--foreground-color--base--dark)" }
 *
 * @example
 * // Component tokens
 * getConstant("height", "small", { pkg: "button" })
 * // { key: "--np--button--height--small", var: "var(--np--button--height--small)" }
 */
export function getConstant(
  token: string,
  param: string,
  options?: CssConstantOptions
): CssConstantResult {
  const { mode, pkg } = options ?? {}
  const suffix = mode ? `--${mode}` : ''
  const key = pkg
    ? `--${NAMESPACE}--${pkg}--${camelToKebab(token)}--${camelToKebab(param)}${suffix}`
    : `--${NAMESPACE}--${camelToKebab(token)}--${camelToKebab(param)}${suffix}`
  return {
    key,
    var: `var(${key})`,
  }
}