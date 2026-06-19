/**
 * Unified token getter — reads from the runtime registry seeded by the
 * generated token data and extended at runtime via `registerTokens` /
 * `setTokens`.
 *
 * Three sibling functions return the three accessor forms:
 * - `getToken` — the `var(--np--…)` reference (the common case)
 * - `getTokenKey` — the bare CSS variable name (no `var(...)` wrapper)
 * - `getTokenValue` — the raw underlying value (e.g. `"16px"`)
 *
 * The token name is the only positional argument; variant / theme / inverse go
 * in an options object.
 *
 * @example
 * getToken("fontSize", { variant: "base" })
 * // → "var(--np--font-size--base)"
 *
 * @example
 * getToken("color", { variant: "base", theme: "night" })
 * // → "var(--np--color--base--night)"
 *
 * @example
 * getToken("backgroundColor", { inverse: true })
 * // → "var(--np--background-color-inverse--base)"
 *
 * @example
 * getTokenValue("fontSize")
 * // → "14px"  (base variant; default/phone primitive of a breakpoint-driven token)
 *
 * Throws on unknown token names. Use [Symbol.hasInstance] of `registry` for
 * detection if you need to branch on presence.
 */

import { getTokenFromMap, type TokenDefinition } from '../utilities/getTokenFromMap.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { DEFAULT_THEME, DEFAULT_BREAKPOINT } from '../constants/styleValues.js'
import { registry, type RegistryEntry } from '../registry/index.js'
import { formatError } from '../utilities/formatError.js'

interface InternalTokenResult {
  key: string
  var: string
  value: string
}

/**
 * Extract the default-dimension primitive for each variant of a registry entry.
 * BreakpointValue entries fold to their default (phone) value; ThemeValue
 * entries fold to their `day` value; plain primitives pass through. Without the
 * breakpoint branch, a breakpoint-driven variant (e.g. fontSize) would reach
 * `getTokenFromMap` as an object and stringify to "[object Object]".
 */
function getDefaultVariants(entry: RegistryEntry): TokenDefinition {
  const result: TokenDefinition = {}
  for (const [key, value] of Object.entries(entry.variants)) {
    // Breakpoint checked first per isStyleValue's discriminator guidance.
    if (isStyleValue("breakpoint", value)) {
      result[key] = value[DEFAULT_BREAKPOINT]
    } else if (isStyleValue("theme", value)) {
      result[key] = value[DEFAULT_THEME]
    } else {
      result[key] = value as TokenDefinition[string]
    }
  }
  return result
}

function resolveToken(name: string, variant: string, theme?: string): InternalTokenResult {
  const entry = registry.get(name)
  if (!entry) {
    throw new Error(
      formatError('tokenNotFound', {
        tokenName: name,
        prefix: '',
        available: '',
      })
    )
  }
  const defaultVariants = getDefaultVariants(entry)
  return getTokenFromMap(
    { [name]: defaultVariants },
    name,
    variant,
    { theme, prefix: entry.prefix }
  )
}

/**
 * Options for the token getters. All optional; the token `name` stays positional.
 * - `variant` — variant within the group (default `"base"`)
 * - `theme`   — pin to a theme primitive (e.g. `"night"`)
 * - `inverse` — resolve the inverse group (`${name}Inverse`); valid for
 *               `color` / `backgroundColor`, throws on groups with no inverse
 */
export interface TokenOptions {
  variant?: string
  theme?: string
  inverse?: boolean
}

// The inverse modules are named `${group}Inverse` (color → colorInverse,
// backgroundColor → backgroundColorInverse).
const resolveName = (name: string, inverse: boolean): string => (inverse ? `${name}Inverse` : name)

/** Returns the `var(--np--…)` reference string. */
export function getToken(name: string, { variant = 'base', theme, inverse = false }: TokenOptions = {}): string {
  return resolveToken(resolveName(name, inverse), variant, theme).var
}

/** Returns the bare CSS variable name (no `var(...)` wrapper). */
export function getTokenKey(name: string, { variant = 'base', theme, inverse = false }: TokenOptions = {}): string {
  return resolveToken(resolveName(name, inverse), variant, theme).key
}

/** Returns the raw token value (e.g. `"16px"`, an hsla string). */
export function getTokenValue(name: string, { variant = 'base', theme, inverse = false }: TokenOptions = {}): string {
  return resolveToken(resolveName(name, inverse), variant, theme).value
}
