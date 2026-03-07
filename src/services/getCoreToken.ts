/**
 * Unified core token getter.
 *
 * Resolves a token value across all registered modules. Without config,
 * returns the base core value. With config.mode, checks the "color" module.
 * With config.breakpoint, checks the "size" module.
 *
 * Resolution order:
 * 1. If config.mode → look up "color" module at that mode key
 * 2. If config.breakpoint → look up "size" module at that breakpoint key
 * 3. Fall back to "core" module at default key ("base")
 *
 * Returns an object with three properties:
 * - `key`: CSS variable name without var() wrapper (e.g., "--np--font-size--base")
 * - `var`: CSS variable with var() wrapper (e.g., "var(--np--font-size--base)")
 * - `value`: Raw token value (e.g., "16px")
 *
 * @param group - Token group name (e.g., "fontSize", "foregroundColor")
 * @param item - Item name within the group (defaults to "base")
 * @param config - Optional resolution config with mode and/or breakpoint
 * @returns Object containing key, var, and value properties
 * @throws Error if token group or item not found in any resolved module
 *
 * @example
 * // Get base core token
 * getCoreToken("fontSize", "base").var
 * // → "var(--np--font-size--base)"
 *
 * @example
 * // Get night mode color token
 * getCoreToken("foregroundColor", "base", { mode: "night" }).var
 * // → "var(--np--foreground-color--base--night)"
 *
 * @example
 * // Get tablet breakpoint size token
 * getCoreToken("fontSize", "large", { breakpoint: "tablet" }).var
 * // → "var(--np--font-size--large)"
 */

import { getModuleValue } from '../store.js'
import { getConstant } from './getConstant.js'
import { formatError } from '../utilities/formatError.js'

export interface CoreTokenConfig {
  /** Theme mode (e.g., "day", "night"). Looks up the "color" module. */
  mode?: string
  /** Responsive breakpoint (e.g., "mobile", "tablet", "desktop"). Looks up the "size" module. */
  breakpoint?: string
}

export interface TokenResult {
  /** CSS variable name without var() wrapper */
  key: string
  /** CSS variable with var() wrapper */
  var: string
  /** Raw token value */
  value: string
}

export function getCoreToken(
  group: string,
  item: string = 'base',
  config?: CoreTokenConfig
): TokenResult {
  const { mode, breakpoint } = config ?? {}

  // Determine which module and dimension key to query
  let value: string | undefined

  // Mode takes priority — check color module
  if (mode) {
    value = getModuleValue('color', mode, group, item)
  }

  // Then breakpoint — check size module
  if (value === undefined && breakpoint) {
    value = getModuleValue('size', breakpoint, group, item)
  }

  // Fall back to core module
  if (value === undefined) {
    value = getModuleValue('core', undefined, group, item)
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

  // Build CSS variable name — mode suffix for forced mode lookups
  const cssConstant = getConstant(group, item, { mode })

  return {
    key: cssConstant.key,
    var: cssConstant.var,
    value,
  }
}