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

const breakpoints = BREAKPOINTS

/**
 * Result object returned by getBreakpoint
 */
export interface BreakpointResult {
  /**
   * The breakpoint value in pixels
   */
  value: number

  /**
   * Media query string
   */
  query: string
}

/**
 * Get breakpoint value and media query string
 *
 * Returns an object with two properties:
 * - `value`: Breakpoint value in pixels
 * - `query`: Media query string
 *
 * Breakpoint behavior:
 * - `BREAKPOINT_PHONE`   ("phone"):   max-width query (0 to phone threshold)
 * - `BREAKPOINT_TABLET`  ("tablet"):  min-width query (phone + 1, derived range)
 * - `BREAKPOINT_LAPTOP`  ("laptop"):  min-width query (laptop threshold and up)
 * - `BREAKPOINT_DESKTOP` ("desktop"): min-width query (desktop threshold and up)
 *
 * When `exact` is true, targets only that specific breakpoint range
 * (bounded by the next-larger breakpoint's threshold minus one).
 *
 * @param name - Breakpoint name
 * @param exact - If true, targets only this breakpoint range
 * @returns Object containing value and query properties
 * @throws Error if breakpoint name not found
 *
 * @example
 * import { getBreakpoint, BREAKPOINT_TABLET } from "nice-styles"
 *
 * const Container = styled.div`
 *   ${getBreakpoint(BREAKPOINT_TABLET).query} {
 *     width: 50%;
 *   }
 * `
 */
export function getBreakpoint(name: BreakpointName, exact?: boolean): BreakpointResult {
  if (name === BREAKPOINT_PHONE) {
    const value = breakpoints[BREAKPOINT_PHONE]
    return {
      value,
      query: `@media (max-width: ${value}px)`
    }
  }

  if (name === BREAKPOINT_TABLET) {
    const value = breakpoints[BREAKPOINT_PHONE] + 1
    if (exact) {
      const maxValue = breakpoints[BREAKPOINT_LAPTOP] - 1
      return {
        value,
        query: `@media (min-width: ${value}px) and (max-width: ${maxValue}px)`
      }
    }
    return {
      value,
      query: `@media (min-width: ${value}px)`
    }
  }

  if (name === BREAKPOINT_LAPTOP) {
    const value = breakpoints[BREAKPOINT_LAPTOP]
    if (exact) {
      const maxValue = breakpoints[BREAKPOINT_DESKTOP] - 1
      return {
        value,
        query: `@media (min-width: ${value}px) and (max-width: ${maxValue}px)`
      }
    }
    return {
      value,
      query: `@media (min-width: ${value}px)`
    }
  }

  if (name === BREAKPOINT_DESKTOP) {
    const value = breakpoints[BREAKPOINT_DESKTOP]
    return {
      value,
      query: `@media (min-width: ${value}px)`
    }
  }

  throw new Error(
    formatError("breakpointNotFound", {
      name,
      available: `${BREAKPOINT_PHONE}, ${BREAKPOINT_TABLET}, ${BREAKPOINT_LAPTOP}, ${BREAKPOINT_DESKTOP}`
    })
  )
}
