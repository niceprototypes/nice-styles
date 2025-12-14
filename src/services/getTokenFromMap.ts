import { getCssConstant } from './getCssConstant.js'

/**
 * Token definition structure
 * Each token has a CSS name and a map of variant keys to values
 */
export interface TokenDefinition {
  name: string
  items: Record<string, string | number>
}

/**
 * Token map structure
 * Keys are camelCase token names, values are TokenDefinition objects
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
   * The raw token value
   */
  value: string
}

/**
 * Get a design token from a token map with CSS variable name and raw value.
 *
 * This is a low-level helper that accepts any prefix and token map,
 * enabling reuse across core tokens and component-level tokens.
 *
 * Returns an object with three properties:
 * - `key`: CSS variable name without var() wrapper (e.g., "--icon--stroke-width--base")
 * - `var`: CSS variable with var() wrapper (e.g., "var(--icon--stroke-width--base)")
 * - `value`: Raw token value (e.g., "1.5px")
 *
 * @param prefix - Package/component prefix (e.g., "core", "icon", "button")
 * @param tokenMap - Object mapping token names to their definitions
 * @param tokenName - The camelCase token name (e.g., "fontSize", "strokeWidth")
 * @param variant - Optional variant name within the token (defaults to "base")
 * @returns Object containing key, var, and value properties
 * @throws Error if token or variant not found
 *
 * @example
 * // Core tokens
 * getTokenFromMap("core", coreTokens, "fontSize", "large")
 * // { key: "--core--font-size--large", var: "var(--core--font-size--large)", value: "24px" }
 *
 * @example
 * // Component tokens
 * getTokenFromMap("icon", iconTokens, "strokeWidth", "small")
 * // { key: "--icon--stroke-width--small", var: "var(--icon--stroke-width--small)", value: "1px" }
 */
export function getTokenFromMap(
  prefix: string,
  tokenMap: TokenMap,
  tokenName: string,
  variant?: string
): TokenResult {
  const definition = tokenMap[tokenName]
  if (!definition) {
    throw new Error(
      `Token "${tokenName}" not found in ${prefix} tokens. ` +
      `Available tokens: ${Object.keys(tokenMap).join(", ")}`
    )
  }

  const variantKey = variant ?? 'base'
  const value = definition.items[variantKey]

  if (value === undefined) {
    throw new Error(
      `Variant "${variantKey}" not found for token "${tokenName}" in ${prefix} tokens. ` +
      `Available variants: ${Object.keys(definition.items).join(", ")}`
    )
  }

  const cssConstant = getCssConstant(prefix, definition.name, variantKey)

  return {
    key: cssConstant.key,
    var: cssConstant.var,
    value: String(value),
  }
}