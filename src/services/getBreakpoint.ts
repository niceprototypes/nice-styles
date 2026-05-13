import { formatError } from '../utilities/formatError.js'
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointName,
} from '../constants/breakpoints.js'

export type { BreakpointName }

/**
 * Internal shape — combines the numeric threshold and the @media query string.
 * Public callers use the dedicated string getters (`getBreakpoint` /
 * `getBreakpointValue`); this shape is shared internally between them.
 */
interface ResolvedBreakpoint {
  value: number
  query: string
}

/**
 * Resolve a breakpoint name into its numeric threshold and @media query.
 *
 * Breakpoint behavior:
 * - `phone`:   max-width query (0 to phone threshold)
 * - `tablet`:  min-width query (phone + 1 and up)
 * - `laptop`:  min-width query (laptop threshold and up)
 * - `desktop`: min-width query (desktop threshold and up)
 *
 * When `exact` is true on tablet/laptop, narrows the query to that band only
 * (bounded by the next-larger breakpoint's threshold minus one).
 *
 * Reads BREAKPOINTS at call time so `setBreakpoints` overrides take effect
 * immediately without re-importing.
 */
function resolveBreakpoint(name: BreakpointName, exact?: boolean): ResolvedBreakpoint {
  if (name === BREAKPOINT_PHONE) {
    const value = BREAKPOINTS[BREAKPOINT_PHONE]
    return { value, query: `@media (max-width: ${value}px)` }
  }

  if (name === BREAKPOINT_TABLET) {
    const value = BREAKPOINTS[BREAKPOINT_PHONE] + 1
    if (exact) {
      const maxValue = BREAKPOINTS[BREAKPOINT_LAPTOP] - 1
      return { value, query: `@media (min-width: ${value}px) and (max-width: ${maxValue}px)` }
    }
    return { value, query: `@media (min-width: ${value}px)` }
  }

  if (name === BREAKPOINT_LAPTOP) {
    const value = BREAKPOINTS[BREAKPOINT_LAPTOP]
    if (exact) {
      const maxValue = BREAKPOINTS[BREAKPOINT_DESKTOP] - 1
      return { value, query: `@media (min-width: ${value}px) and (max-width: ${maxValue}px)` }
    }
    return { value, query: `@media (min-width: ${value}px)` }
  }

  if (name === BREAKPOINT_DESKTOP) {
    const value = BREAKPOINTS[BREAKPOINT_DESKTOP]
    return { value, query: `@media (min-width: ${value}px)` }
  }

  throw new Error(
    formatError("breakpointNotFound", {
      name,
      available: `${BREAKPOINT_PHONE}, ${BREAKPOINT_TABLET}, ${BREAKPOINT_LAPTOP}, ${BREAKPOINT_DESKTOP}`
    })
  )
}

/**
 * Returns the `@media` query string for a breakpoint.
 *
 * Pass directly into a styled-components template — the `@media` prefix is
 * included in the returned string.
 *
 * @example
 * import { getBreakpoint } from "nice-styles"
 *
 * const Container = styled.div`
 *   ${getBreakpoint("tablet")} {
 *     width: 50%;
 *   }
 * `
 * // → "@media (min-width: 641px) { ... }"
 */
export function getBreakpoint(name: BreakpointName, exact?: boolean): string {
  return resolveBreakpoint(name, exact).query
}

/**
 * Returns the breakpoint threshold in pixels as a raw number. Use when CSS
 * isn't the target — e.g. JS comparisons against `window.innerWidth`, labels
 * in docs, or any consumer that needs the literal number.
 *
 * @example getBreakpointValue("laptop") // → 1280
 */
export function getBreakpointValue(name: BreakpointName): number {
  return resolveBreakpoint(name).value
}
