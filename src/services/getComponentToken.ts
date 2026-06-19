import componentTokensData from '../generated/componentTokensData.js'
import { getTokenFromMap, getTokenByPath } from '../utilities/getTokenFromMap.js'
import type { ComponentPrefix } from '../generated/types.js'

/**
 * Component-scoped token getters.
 *
 * Only the component `prefix` is positional; the token name, variant, and
 * mode go in an options object. `token` may be a string (flat, depth-1
 * lookup) or a path array (nested lookup, walks arbitrary depth).
 *
 * **Flat lookup:**
 * ```ts
 * getComponentToken("button", { token: "size", variant: "base" })
 * // → "var(--np--button--size--base)"
 * ```
 *
 * **Path lookup** (variant is part of the path):
 * ```ts
 * getComponentToken("button", { token: ["status", "primary", "backgroundColor", "base"] })
 * // → "var(--np--button--status--primary--background-color--base)"
 * ```
 *
 * Three sibling functions return the three accessor forms:
 * - `getComponentToken` — the `var(...)` reference (the common case)
 * - `getComponentTokenKey` — the bare CSS variable name
 * - `getComponentTokenValue` — the raw underlying value
 *
 * @throws Error if prefix, token, variant, or path segment not found
 */

export interface ComponentTokenOptions {
  /** Token name (depth-1) or a path array for nested tokens. */
  token: string | string[]
  /** Variant within the token (flat lookups only; default "base"). */
  variant?: string
  /** Theme/mode pin (e.g. "night"). */
  mode?: string
}

interface InternalTokenResult {
  key: string
  var: string
  value: string
}

function resolveComponentToken(
  prefix: ComponentPrefix,
  { token, variant, mode }: ComponentTokenOptions
): InternalTokenResult {
  const componentData = componentTokensData[prefix]
  if (!componentData) {
    const available = Object.keys(componentTokensData).join(', ')
    throw new Error(`Component prefix "${prefix}" not found. Available prefixes: ${available}`)
  }

  if (Array.isArray(token)) {
    return getTokenByPath(componentData, token, { theme: mode, prefix })
  }

  return getTokenFromMap(
    componentData as Record<string, Record<string, string | number>>,
    token,
    variant ?? 'base',
    { theme: mode, prefix }
  )
}

/** Returns the `var(--np--…)` reference for a component token. */
export function getComponentToken(prefix: ComponentPrefix, options: ComponentTokenOptions): string {
  return resolveComponentToken(prefix, options).var
}

/** Returns the bare CSS variable name for a component token. */
export function getComponentTokenKey(prefix: ComponentPrefix, options: ComponentTokenOptions): string {
  return resolveComponentToken(prefix, options).key
}

/** Returns the raw value for a component token. */
export function getComponentTokenValue(prefix: ComponentPrefix, options: ComponentTokenOptions): string {
  return resolveComponentToken(prefix, options).value
}
