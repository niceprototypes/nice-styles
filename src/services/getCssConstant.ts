import { camelToKebab } from './camelToKebab.js'

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
 * Creates a standardized CSS custom property name following the Nice pattern:
 * --{pkg}--{token}--{param} with optional --{mode} suffix.
 *
 * Uses double dashes as segment delimiters, allowing single dashes
 * within segments for compound words. Accepts camelCase input and
 * automatically converts to kebab-case.
 *
 * @param pkg - Package/component prefix (e.g., "core", "button", "icon")
 * @param token - Token name in camelCase (e.g., "foregroundColor", "statusPrimaryBase")
 * @param param - Parameter/variant name in camelCase (e.g., "base", "backgroundColor")
 * @param mode - Optional theme mode suffix (e.g., "light", "dark"). Appends --{mode} to the key.
 * @returns Object with key and var properties
 *
 * @example
 * // Core tokens
 * getConstant("core", "foregroundColor", "base")
 * // { key: "--core--foreground-color--base", var: "var(--core--foreground-color--base)" }
 *
 * @example
 * // Force light mode
 * getConstant("core", "backgroundColor", "base", "light")
 * // { key: "--core--background-color--base--light", var: "var(--core--background-color--base--light)" }
 *
 * @example
 * // Force dark mode
 * getConstant("core", "foregroundColor", "base", "dark")
 * // { key: "--core--foreground-color--base--dark", var: "var(--core--foreground-color--base--dark)" }
 *
 * @example
 * // Component tokens
 * getConstant("button", "height", "small")
 * // { key: "--button--height--small", var: "var(--button--height--small)" }
 */
export function getConstant(
  pkg: string,
  token: string,
  param: string,
  mode?: string
): CssConstantResult {
  const suffix = mode ? `--${mode}` : ''
  const key = `--${pkg}--${camelToKebab(token)}--${camelToKebab(param)}${suffix}`
  return {
    key,
    var: `var(${key})`,
  }
}
