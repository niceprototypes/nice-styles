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
 * For `getToken`, the variant is the second positional argument; theme /
 * inverse / pristine go in a trailing options object. (`getTokenKey` /
 * `getTokenValue` keep the variant inside their options object.)
 *
 * @example
 * getToken("fontSize", "base")
 * // → "var(--np--font-size)"
 *
 * @example
 * getToken("color", "base", { theme: "night" })
 * // → "var(--np--color--night)"
 *
 * @example
 * getToken("backgroundColor", undefined, { inverse: true })
 * // → "var(--np--background-color--inverse)"
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
import { registry, defaultsRegistry, type RegistryEntry } from '../registry/index.js'
import { formatError } from '../utilities/formatError.js'
import { getConstantKey } from './getConstant.js'
import inverseTokensData from '../generated/inverseTokensData.js'

interface InternalTokenResult {
  key: string
  var: string
  value: string
}

/**
 * Extract the per-variant primitive for a registry entry at the requested theme.
 * BreakpointValue entries fold to their default (phone) value; ThemeValue entries
 * fold to the requested `theme` (default `day`, falling back to `day` when the
 * theme has no override); plain primitives pass through. Without the breakpoint
 * branch, a breakpoint-driven variant (e.g. fontSize) would reach
 * `getTokenFromMap` as an object and stringify to "[object Object]".
 *
 * Folding to the requested theme is what lets `getTokenValue(name, { theme })`
 * return the night (or any-theme) value, not just day.
 */
function getDefaultVariants(entry: RegistryEntry, theme: string = DEFAULT_THEME): TokenDefinition {
  const result: TokenDefinition = {}
  for (const [key, value] of Object.entries(entry.variants)) {
    // Breakpoint checked first per isStyleValue's discriminator guidance.
    if (isStyleValue("breakpoint", value)) {
      result[key] = value[DEFAULT_BREAKPOINT]
    } else if (isStyleValue("theme", value)) {
      const themed = value as Record<string, string>
      result[key] = themed[theme] ?? themed[DEFAULT_THEME]
    } else {
      result[key] = value as TokenDefinition[string]
    }
  }
  return result
}

function resolveToken(name: string, variant: string, theme?: string, pristine = false): InternalTokenResult {
  const entry = (pristine ? defaultsRegistry : registry).get(name)
  if (!entry) {
    throw new Error(
      formatError('tokenNotFound', {
        tokenName: name,
        prefix: '',
        available: '',
      })
    )
  }
  const defaultVariants = getDefaultVariants(entry, theme)
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
 * - `inverse` — the inverse-color dimension. Appends a trailing `--inverse`
 *               segment (`--np--color--inverse`, `--night--inverse` with
 *               a theme). Valid for `color` / `backgroundColor`; throws otherwise.
 * - `pristine` — resolve against the seed snapshot taken before any runtime
 *               `setTokens` override. The var/key are identical either way; only
 *               the value differs. Use for canonical-default displays (token
 *               reference docs), not normal consumption.
 */
export interface TokenOptions {
  variant?: string
  theme?: string
  inverse?: boolean
  pristine?: boolean
}

/**
 * Resolve an inverse-color token. The var/key are built directly via
 * `getConstant` under the BASE group name with a `--inverse` segment; the value
 * comes from the generated `$inverse` data (day by default — the semantic var
 * flips to night via @media — or the requested theme's primitive).
 */
function resolveInverse(name: string, variant: string, theme?: string): InternalTokenResult {
  const group = (inverseTokensData as Record<string, { day: Record<string, string>; night: Record<string, string> }>)[name]
  if (!group) {
    throw new Error(
      formatError('tokenNotFound', {
        tokenName: `${name} (inverse)`,
        prefix: '',
        available: Object.keys(inverseTokensData).join(', '),
      })
    )
  }
  if (!(variant in group.day)) {
    throw new Error(
      formatError('variantNotFound', {
        variantName: variant,
        tokenName: `${name} (inverse)`,
        prefix: '',
        available: Object.keys(group.day).join(', '),
      })
    )
  }
  // No theme → day value (the reactive default the semantic var starts at).
  const dimension = theme === 'night' ? group.night : group.day
  const key = getConstantKey(name, variant, { theme, inverse: true })
  return { key, var: `var(${key})`, value: dimension[variant] }
}

/**
 * Returns the `var(--np--…)` reference string.
 *
 * Unlike its `getTokenKey` / `getTokenValue` siblings, `getToken` takes the
 * variant as its second positional argument (the common case); theme / inverse
 * / pristine stay in the trailing options object.
 */
export function getToken(name: string, variant: string = 'base', { theme, inverse = false, pristine = false }: Omit<TokenOptions, 'variant'> = {}): string {
  return (inverse ? resolveInverse(name, variant, theme) : resolveToken(name, variant, theme, pristine)).var
}

/** Returns the bare CSS variable name (no `var(...)` wrapper). */
export function getTokenKey(name: string, { variant = 'base', theme, inverse = false, pristine = false }: TokenOptions = {}): string {
  return (inverse ? resolveInverse(name, variant, theme) : resolveToken(name, variant, theme, pristine)).key
}

/** Returns the raw token value (e.g. `"16px"`, an hsla string). */
export function getTokenValue(name: string, { variant = 'base', theme, inverse = false, pristine = false }: TokenOptions = {}): string {
  return (inverse ? resolveInverse(name, variant, theme) : resolveToken(name, variant, theme, pristine)).value
}
