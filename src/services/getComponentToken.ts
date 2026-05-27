import componentTokensData from '../generated/componentTokensData.js'
import { getTokenFromMap, getTokenByPath } from '../utilities/getTokenFromMap.js'
import type { ComponentPrefix } from '../generated/types.js'

/**
 * Component-scoped token getters.
 *
 * Two calling conventions:
 *
 * **Flat lookup** — for tokens at depth 1 (tokenName → variant → value):
 * ```ts
 * getComponentToken("button", "size", "base")
 * // → "var(--np--button--size--base)"
 * ```
 *
 * **Path lookup** — for deeply nested tokens (walks arbitrary depth):
 * ```ts
 * getComponentToken("button", ["status", "primary", "base", "backgroundColor"])
 * // → "var(--np--button--status--primary--base--background-color)"
 * ```
 *
 * Three sibling functions return the three accessor forms:
 * - `getComponentToken` — the `var(...)` reference (the common case)
 * - `getComponentTokenKey` — the bare CSS variable name
 * - `getComponentTokenValue` — the raw underlying value
 *
 * @throws Error if prefix, token, variant, or path segment not found
 */

interface InternalTokenResult {
  key: string
  var: string
  value: string
}

function resolveComponentToken(
  prefix: ComponentPrefix,
  tokenNameOrPath: string | string[],
  variantOrTheme?: string,
  theme?: string
): InternalTokenResult {
  const componentData = componentTokensData[prefix]
  if (!componentData) {
    const available = Object.keys(componentTokensData).join(', ')
    throw new Error(`Component prefix "${prefix}" not found. Available prefixes: ${available}`)
  }

  if (Array.isArray(tokenNameOrPath)) {
    return getTokenByPath(componentData, tokenNameOrPath, { theme: variantOrTheme, prefix })
  }

  return getTokenFromMap(
    componentData as Record<string, Record<string, string | number>>,
    tokenNameOrPath,
    variantOrTheme ?? 'base',
    { theme, prefix }
  )
}

/** Returns the `var(--np--…)` reference for a component token. */
export function getComponentToken(
  prefix: ComponentPrefix,
  tokenNameOrPath: string | string[],
  variantOrTheme?: string,
  theme?: string
): string {
  return resolveComponentToken(prefix, tokenNameOrPath, variantOrTheme, theme).var
}

/** Returns the bare CSS variable name for a component token. */
export function getComponentTokenKey(
  prefix: ComponentPrefix,
  tokenNameOrPath: string | string[],
  variantOrTheme?: string,
  theme?: string
): string {
  return resolveComponentToken(prefix, tokenNameOrPath, variantOrTheme, theme).key
}

/** Returns the raw value for a component token. */
export function getComponentTokenValue(
  prefix: ComponentPrefix,
  tokenNameOrPath: string | string[],
  variantOrTheme?: string,
  theme?: string
): string {
  return resolveComponentToken(prefix, tokenNameOrPath, variantOrTheme, theme).value
}
