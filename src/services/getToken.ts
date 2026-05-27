/**
 * Unified token getter — reads from the runtime registry seeded by the
 * generated token data and extended at runtime via `registerTokens` /
 * `createTokens`.
 *
 * Three sibling functions return the three accessor forms:
 * - `getToken` — the `var(--np--…)` reference (the common case)
 * - `getTokenKey` — the bare CSS variable name (no `var(...)` wrapper)
 * - `getTokenValue` — the raw underlying value (e.g. `"16px"`)
 *
 * @example
 * getToken("fontSize", "base")
 * // → "var(--np--font-size--base)"
 *
 * @example
 * getToken("color", "base", "night")
 * // → "var(--np--color--base--night)"
 *
 * @example
 * getTokenValue("fontSize", "base")
 * // → "16px"
 *
 * Throws on unknown token names. Use [Symbol.hasInstance] of `registry` for
 * detection if you need to branch on presence.
 */

import { getTokenFromMap, type TokenDefinition } from '../utilities/getTokenFromMap.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'
import { registry, type RegistryEntry } from '../registry/index.js'
import { formatError } from '../utilities/formatError.js'

interface InternalTokenResult {
  key: string
  var: string
  value: string
}

/**
 * Extract default-theme variants from a registry entry. ThemeValue entries are
 * flattened to their `day` value; BreakpointValue entries remain as-is so
 * `getTokenFromMap` can pick the right primitive when needed.
 */
function getDefaultVariants(entry: RegistryEntry): TokenDefinition {
  const result: TokenDefinition = {}
  for (const [key, value] of Object.entries(entry.variants)) {
    if (isStyleValue("theme", value)) {
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

/** Returns the `var(--np--…)` reference string. */
export function getToken(name: string, variant: string = 'base', theme?: string): string {
  return resolveToken(name, variant, theme).var
}

/** Returns the bare CSS variable name (no `var(...)` wrapper). */
export function getTokenKey(name: string, variant: string = 'base', theme?: string): string {
  return resolveToken(name, variant, theme).key
}

/** Returns the raw token value (e.g. `"16px"`, an hsla string). */
export function getTokenValue(name: string, variant: string = 'base', theme?: string): string {
  return resolveToken(name, variant, theme).value
}
