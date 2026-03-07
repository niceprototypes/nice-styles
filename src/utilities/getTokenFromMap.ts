import { getConstant, NAMESPACE } from '../services/getConstant.js'
import { camelToKebab } from './camelToKebab.js'
import { formatError } from './formatError.js'

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
 * Recursive token node for nested component token trees.
 * A string leaf is a resolved value; an object is a branch to descend.
 */
export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }

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
 * Options for getTokenFromMap
 */
export interface TokenFromMapOptions {
  /** Theme mode (e.g., "dark"). Appends --{mode} to CSS variable. */
  mode?: string
  /** Component prefix (e.g., "button", "icon"). Omit for base tokens. */
  prefix?: string
}

/**
 * Get a design token from a flat token map with CSS variable name and raw value.
 *
 * ```ts
 * { strokeWidth: { small: "1px", base: "1.5px" } }
 * ```
 * CSS name derived from key via camelToKebab: strokeWidth → stroke-width
 *
 * **Mode option** (for theme variants):
 * When mode is specified (e.g., "dark"), the CSS variable includes the mode suffix:
 * ```ts
 * getTokenFromMap(tokens, "foregroundColor", "base", { mode: "dark" })
 * // → { key: "--np--foreground-color--base--dark", ... }
 * ```
 *
 * @param tokenMap - Token definitions mapping variant keys to values
 * @param tokenName - camelCase token key (e.g., "fontSize", "strokeWidth")
 * @param variant - Variant within token (defaults to "base")
 * @param options - Optional mode and prefix
 * @returns { key, var, value } - CSS variable name, var() wrapped, raw value
 * @throws Error if token or variant not found
 */
export function getTokenFromMap(
  tokenMap: TokenMap,
  tokenName: string,
  variant?: string,
  options?: TokenFromMapOptions
): TokenResult {
  const { mode, prefix } = options ?? {}
  const definition = tokenMap[tokenName]
  if (!definition) {
    throw new Error(
      formatError("tokenNotFound", {
        tokenName,
        prefix: prefix ?? "",
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
        prefix: prefix ?? "",
        available: Object.keys(definition).join(", ")
      })
    )
  }

  const cssConstant = getConstant(cssName, variantKey, { mode, pkg: prefix })

  return {
    key: cssConstant.key,
    var: cssConstant.var,
    value: String(value),
  }
}

/**
 * Get a design token from a nested component token tree by path.
 *
 * Walks the tree using the path segments, each becoming a -- delimited
 * segment in the CSS variable name. The final segment must resolve to
 * a string leaf value.
 *
 * @param tree - Nested component token tree (from componentTokensData[prefix])
 * @param path - Array of path segments to the leaf value
 * @param options - Optional mode and prefix
 * @returns { key, var, value } - CSS variable name, var() wrapped, raw value
 * @throws Error if any path segment not found or path doesn't reach a leaf
 *
 * @example
 * getTokenByPath(buttonTree, ["status", "primary", "base", "backgroundColor"], { prefix: "button" })
 * // → { key: "--np--button--status--primary--base--background-color", var: "var(...)", value: "..." }
 *
 * @example
 * getTokenByPath(buttonTree, ["size", "base"], { prefix: "button" })
 * // → { key: "--np--button--size--base", var: "var(...)", value: "var(--np--cell-height--base)" }
 */
export function getTokenByPath(
  tree: { [key: string]: ComponentTokenNode },
  path: string[],
  options?: TokenFromMapOptions
): TokenResult {
  const { mode, prefix } = options ?? {}

  let current: ComponentTokenNode = tree as { [key: string]: ComponentTokenNode }
  for (let i = 0; i < path.length; i++) {
    const segment = path[i]
    if (typeof current !== 'object' || current === null) {
      throw new Error(
        `Token path "${path.slice(0, i + 1).join('.')}" reached a leaf before the full path was consumed.${prefix ? ` Component: ${prefix}.` : ''}`
      )
    }
    const next: ComponentTokenNode | undefined = (current as { [key: string]: ComponentTokenNode })[segment]
    if (next === undefined) {
      throw new Error(
        `Token path segment "${segment}" not found at "${path.slice(0, i).join('.') || '(root)'}".${prefix ? ` Component: ${prefix}.` : ''} Available: ${Object.keys(current).join(', ')}`
      )
    }
    current = next
  }

  if (typeof current !== 'string') {
    throw new Error(
      `Token path "${path.join('.')}" resolved to a branch, not a leaf value.${prefix ? ` Component: ${prefix}.` : ''} Available keys: ${Object.keys(current).join(', ')}`
    )
  }

  const cssSegments = path.map(s => camelToKebab(s))
  const suffix = mode ? `--${mode}` : ''
  const key = prefix
    ? `--${NAMESPACE}--${prefix}--${cssSegments.join('--')}${suffix}`
    : `--${NAMESPACE}--${cssSegments.join('--')}${suffix}`

  return {
    key,
    var: `var(${key})`,
    value: current,
  }
}
