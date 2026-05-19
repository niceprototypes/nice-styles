/**
 * Size (breakpoint-pinned) token getters.
 *
 * Returns a *pinned* reference to a specific breakpoint's primitive, e.g.
 * `var(--np--font-size--base--laptop)`. Use this when a value must stay fixed
 * regardless of viewport. For the auto-switching semantic variable, use
 * `getToken` directly — that's the common case.
 *
 * Three sibling functions return the three accessor forms.
 *
 * @example
 * import { getBreakpointToken, BREAKPOINT_TABLET } from "nice-styles"
 *
 * getBreakpointToken("fontSize", "large", BREAKPOINT_TABLET)
 * // → "var(--np--font-size--large--tablet)"
 *
 * @example
 * getBreakpointTokenValue("fontSize", "large", BREAKPOINT_TABLET)
 * // → "28px"
 */

import { getConstant, getConstantKey } from './getConstant.js'
import { formatError } from '../utilities/formatError.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { registry } from '../registry/index.js'
import { BREAKPOINT_PHONE } from '../constants/breakpoints.js'

function resolveSizeValue(group: string, item: string, breakpoint: string): string {
  const entry = registry.get(group)
  if (!entry) {
    throw new Error(
      formatError('tokenNotFound', { tokenName: group, prefix: '', available: '' })
    )
  }
  const variant = entry.variants[item]
  if (variant === undefined) {
    throw new Error(
      formatError('tokenNotFound', { tokenName: `${group}.${item}`, prefix: '', available: '' })
    )
  }
  if (isStyleValue('breakpoint', variant)) {
    const value = variant[breakpoint]
    if (typeof value === 'string') return value
    // Fall through to default breakpoint if the requested one is missing.
    const fallback = variant[BREAKPOINT_PHONE]
    if (typeof fallback === 'string') return fallback
  }
  // Non-responsive variants return their bare value at every breakpoint.
  if (typeof variant === 'string') return variant
  return String(variant)
}

/** Returns the pinned `var(--np--…--{breakpoint})` reference for a size token. */
export function getBreakpointToken(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): string {
  return getConstant(group, item, { breakpoint })
}

/** Returns the pinned bare CSS variable name. */
export function getBreakpointTokenKey(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): string {
  return getConstantKey(group, item, { breakpoint })
}

/** Returns the raw size value at the given breakpoint (e.g. `"16px"`). */
export function getBreakpointTokenValue(
  group: string,
  item: string = 'base',
  breakpoint: string = BREAKPOINT_PHONE
): string {
  return resolveSizeValue(group, item, breakpoint)
}
