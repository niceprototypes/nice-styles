import { getCssConstant } from './getCssConstant.js'
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
 * Legacy token definition with explicit name/items (used by core tokens.json)
 */
interface LegacyTokenDefinition {
  name: string
  items: Record<string, string | number>
}

/**
 * Check if a token definition uses the legacy name/items format
 */
function isLegacyFormat(def: unknown): def is LegacyTokenDefinition {
  return typeof def === 'object' && def !== null && 'name' in def && 'items' in def
}

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
 * Supports two token map formats:
 *
 * **Flat format** (recommended for component tokens):
 * ```ts
 * { strokeWidth: { small: "1px", base: "1.5px" } }
 * ```
 * CSS name derived from key via camelToKebab: strokeWidth → stroke-width
 *
 * **Legacy format** (used by core tokens.json):
 * ```ts
 * { strokeWidth: { name: "stroke-width", items: { small: "1px", base: "1.5px" } } }
 * ```
 * CSS name from explicit `name` property
 *
 * **Mode parameter** (for theme variants):
 * When mode is specified (e.g., "dark"), the CSS variable includes the mode suffix:
 * ```ts
 * getTokenFromMap("core", tokens, "foregroundColor", "base", "dark")
 * // → { key: "--core--foreground-color--base--dark", ... }
 * ```
 *
 * @param prefix - Component prefix for CSS variable (e.g., "core", "icon", "button")
 * @param tokenMap - Token definitions in flat or legacy format
 * @param tokenName - camelCase token key (e.g., "fontSize", "strokeWidth")
 * @param variant - Variant within token (defaults to "base")
 * @param mode - Optional theme mode (e.g., "dark"). Appends --{mode} to CSS variable.
 * @returns { key, var, value } - CSS variable name, var() wrapped, raw value
 * @throws Error if token or variant not found
 */
export function getTokenFromMap(
  prefix: string,
  tokenMap: TokenMap | Record<string, LegacyTokenDefinition>,
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

  // Handle both legacy (name/items) and flat formats
  let cssName: string
  let value: string | number | undefined

  if (isLegacyFormat(definition)) {
    cssName = definition.name
    value = definition.items[variantKey]
  } else {
    cssName = camelToKebab(tokenName)
    value = definition[variantKey]
  }

  if (value === undefined) {
    const availableVariants = isLegacyFormat(definition)
      ? Object.keys(definition.items)
      : Object.keys(definition)
    throw new Error(
      formatError("variantNotFound", {
        variantName: variantKey,
        tokenName,
        prefix,
        available: availableVariants.join(", ")
      })
    )
  }

  // Build CSS variable key, optionally with mode suffix
  const cssVariantKey = mode ? `${variantKey}--${mode}` : variantKey
  const cssConstant = getCssConstant(prefix, cssName, cssVariantKey)

  return {
    key: cssConstant.key,
    var: cssConstant.var,
    value: String(value),
  }
}
