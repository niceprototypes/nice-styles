import componentTokensData from '../generated/componentTokensData.js'
import { getTokenFromMap, getTokenByPath, type TokenResult } from '../utilities/getTokenFromMap.js'
import type { ComponentPrefix } from '../generated/types.js'

/**
 * Get a component-scoped design token with CSS variable name and raw value.
 *
 * Two calling conventions:
 *
 * **Flat lookup** — for tokens at depth 1 (tokenName → variant → value):
 * ```ts
 * getComponentToken("button", "size", "base")
 * // → { key: "--np--button--size--base", var: "var(--np--button--size--base)", value: "..." }
 * ```
 *
 * **Path lookup** — for deeply nested tokens (walks arbitrary depth):
 * ```ts
 * getComponentToken("button", ["status", "primary", "base", "backgroundColor"])
 * // → { key: "--np--button--status--primary--base--background-color", var: "var(...)", value: "..." }
 * ```
 *
 * @throws Error if prefix, token, variant, or path segment not found
 */
export function getComponentToken(
  prefix: ComponentPrefix,
  tokenNameOrPath: string | string[],
  variantOrMode?: string,
  mode?: string
): TokenResult {
  const componentData = componentTokensData[prefix]
  if (!componentData) {
    const available = Object.keys(componentTokensData).join(', ')
    throw new Error(`Component prefix "${prefix}" not found. Available prefixes: ${available}`)
  }

  // Path-based lookup: second arg is string[]
  if (Array.isArray(tokenNameOrPath)) {
    // variantOrMode is actually mode in this overload
    return getTokenByPath(componentData, tokenNameOrPath, { mode: variantOrMode, prefix })
  }

  // Flat lookup: second arg is string (flat tokens conform to TokenMap at runtime)
  return getTokenFromMap(componentData as Record<string, Record<string, string | number>>, tokenNameOrPath, variantOrMode ?? "base", { mode, prefix })
}