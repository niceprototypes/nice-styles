import { camelToKebab } from './camelToKebab.js'

/**
 * Result object returned by getCssConstant
 */
export interface CssConstantResult {
  /**
   * The CSS variable name (with or without var() wrapper based on isVar param)
   */
  key: string

  /**
   * The CSS variable with var() wrapper
   */
  var: string
}

/**
 * Creates a standardized CSS custom property name following the Nice pattern:
 * --{pkg}--{token}--{param}
 *
 * Uses double dashes as segment delimiters, allowing single dashes
 * within segments for compound words. Accepts camelCase input and
 * automatically converts to kebab-case.
 *
 * @param pkg - Package/component prefix (e.g., "core", "button", "icon")
 * @param token - Token name in camelCase (e.g., "foregroundColor", "statusPrimaryBase")
 * @param param - Parameter/variant name in camelCase (e.g., "base", "backgroundColor")
 * @returns Object with key and var properties
 *
 * @example
 * // Core tokens
 * getCssConstant("core", "foregroundColor", "base")
 * // { key: "--core--foreground-color--base", var: "var(--core--foreground-color--base)" }
 *
 * @example
 * // Component tokens
 * getCssConstant("button", "height", "small")
 * // { key: "--button--height--small", var: "var(--button--height--small)" }
 *
 * @example
 * // Compound names
 * getCssConstant("button", "statusPrimaryBase", "backgroundColor")
 * // { key: "--button--status-primary-base--background-color", var: "var(--button--status-primary-base--background-color)" }
 */
export function getCssConstant(
  pkg: string,
  token: string,
  param: string
): CssConstantResult {
  const key = `--${pkg}--${camelToKebab(token)}--${camelToKebab(param)}`
  return {
    key,
    var: `var(${key})`,
  }
}