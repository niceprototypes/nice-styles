import { getConstant } from './getCssConstant.js'
import { camelToKebab } from './camelToKebab.js'
import { formatError } from '../helpers/formatError.js'

/**
 * Token definition structure (flat format)
 * Direct mapping of variant keys to values
 * CSS name is derived from the token map key via camelToKebab
 */
export type TokenDefinition = Record<string, string | number>

/**
 * Token map structure
 * Keys are camelCase token names (converted to kebab-case for CSS)
 * Values are variant → value mappings
 */
export type TokenMap = Record<string, TokenDefinition>

/**
 * Result object returned by getTokenFromMap
 */
export interface TokenResult {
  /**
   * The CSS variable name without var() wrapper
   */
  key: string

  /**
   * The CSS variable with var() wrapper
   */
  var: string

  /**
   * The raw token value (default theme value)
   */
  value: string
}

/**
 * Get a design token from a token map with CSS variable name and raw value.
 *
 * ```ts
 * { strokeWidth: { small: "1px", base: "1.5px" } }
 * ```
 * CSS name derived from key via camelToKebab: strokeWidth → stroke-width
 *
 * **Mode parameter** (for theme variants):
 * When mode is specified (e.g., "dark"), the CSS variable includes the mode suffix:
 * ```ts
 * getTokenFromMap("core", tokens, "foregroundColor", "base", "dark")
 * // → { key: "--core--foreground-color--base--dark", ... }
 * ```
 *
 * @param prefix - Component prefix for CSS variable (e.g., "core", "icon", "button")
 * @param tokenMap - Token definitions mapping variant keys to values
 * @param tokenName - camelCase token key (e.g., "fontSize", "strokeWidth")
 * @param variant - Variant within token (defaults to "base")
 * @param mode - Optional theme mode (e.g., "dark"). Appends --{mode} to CSS variable.
 * @returns { key, var, value } - CSS variable name, var() wrapped, raw value
 * @throws Error if token or variant not found
 */
export function getTokenFromMap(
  prefix: string,
  tokenMap: TokenMap,
  tokenName: string,
  variant?: string,
  mode?: string
): TokenResult {
  const definition = tokenMap[tokenName]
  if (!definition) {
    throw new Error(
      formatError("tokenNotFound", {
        tokenName,
        prefix,
        available: Object.keys(tokenMap).join(", ")
      })
    )
  }

  const variantKey = variant ?? 'base'
  const cssName = camelToKebab(tokenName)
  const value = definition[variantKey]

  if (value === undefined) {
    throw new Error(
      formatError("variantNotFound", {
        variantName: variantKey,
        tokenName,
        prefix,
        available: Object.keys(definition).join(", ")
      })
    )
  }

  const cssConstant = getConstant(prefix, cssName, variantKey, mode)

  return {
    key: cssConstant.key,
    var: cssConstant.var,
    value: String(value),
  }
}
