/**
 * Unified core token getter.
 *
 * Resolves a token across all registered modules. Without config, returns the
 * base core value. With config.mode, checks the "color" module. With
 * config.breakpoint, checks the "size" module.
 *
 * Resolution order:
 * 1. If config.mode → look up "color" module at that mode key
 * 2. If config.breakpoint → look up "size" module at that breakpoint key
 * 3. Fall back to "core" module at default key ("base")
 *
 * Three sibling functions return the three accessor forms:
 * - `getToken` — the `var(...)` reference (the common case)
 * - `getTokenKey` — the bare CSS variable name (no `var(...)` wrapper)
 * - `getTokenValue` — the raw underlying value (e.g. `"16px"`)
 *
 * @example
 * getToken("fontSize", "base")
 * // → "var(--np--font-size--base)"
 *
 * @example
 * getTokenKey("fontSize", "base")
 * // → "--np--font-size--base"
 *
 * @example
 * getTokenValue("fontSize", "base")
 * // → "16px"
 */

import { getModuleValue } from '../store.js'
import { getConstant } from './getConstant.js'
import { formatError } from '../utilities/formatError.js'

export interface CoreTokenConfig {
  /** Theme mode (e.g., "day", "night"). Looks up the "color" module. */
  mode?: string
  /** Responsive breakpoint (e.g., "phone", "tablet", "laptop"). Looks up the "size" module. */
  breakpoint?: string
}

interface InternalTokenResult {
  key: string
  var: string
  value: string
}

function resolveToken(
  group: string,
  item: string,
  config?: CoreTokenConfig
): InternalTokenResult {
  const { mode, breakpoint } = config ?? {}

  let value: string | undefined

  if (mode) {
    value = getModuleValue('color', mode, group, item)
  }

  if (value === undefined && breakpoint) {
    value = getModuleValue('size', breakpoint, group, item)
  }

  if (value === undefined) {
    value = getModuleValue('core', undefined, group, item)
  }
  if (value === undefined) {
    value = getModuleValue('color', undefined, group, item)
  }
  if (value === undefined) {
    value = getModuleValue('size', undefined, group, item)
  }

  if (value === undefined) {
    throw new Error(
      formatError('tokenNotFound', {
        tokenName: group,
        prefix: '',
        available: ''
      })
    )
  }

  const cssConstant = getConstant(group, item, { mode })
  return { key: cssConstant.key, var: cssConstant.var, value }
}

/** Returns the `var(--np--…)` reference string. */
export function getToken(
  group: string,
  item: string = 'base',
  config?: CoreTokenConfig
): string {
  return resolveToken(group, item, config).var
}

/** Returns the bare CSS variable name (no `var(...)` wrapper). */
export function getTokenKey(
  group: string,
  item: string = 'base',
  config?: CoreTokenConfig
): string {
  return resolveToken(group, item, config).key
}

/** Returns the raw token value (e.g. `"16px"`, an hsla string). */
export function getTokenValue(
  group: string,
  item: string = 'base',
  config?: CoreTokenConfig
): string {
  return resolveToken(group, item, config).value
}
