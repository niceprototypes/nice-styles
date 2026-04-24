import { formatError } from '../utilities/formatError.js'
import {
  BREAKPOINTS,
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_LARGE,
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
 * - `BREAKPOINT_SMALL` ("small"):  max-width query (0 to small threshold)
 * - `BREAKPOINT_MEDIUM` ("medium"): min-width query (small + 1, derived)
 * - `BREAKPOINT_LARGE` ("large"):  min-width query (large threshold and up)
 *
 * When `exact` is true, targets only that specific breakpoint range.
 *
 * @param name - Breakpoint name
 * @param exact - If true, targets only this breakpoint range
 * @returns Object containing value and query properties
 * @throws Error if breakpoint name not found
 *
 * @example
 * import { getBreakpoint, BREAKPOINT_MEDIUM } from "nice-styles"
 *
 * const Container = styled.div`
 *   ${getBreakpoint(BREAKPOINT_MEDIUM).query} {
 *     width: 50%;
 *   }
 * `
 */
export function getBreakpoint(name: BreakpointName, exact?: boolean): BreakpointResult {
  if (name === BREAKPOINT_SMALL) {
    const value = breakpoints[BREAKPOINT_SMALL]
    return {
      value,
      query: `@media (max-width: ${value}px)`
    }
  }

  if (name === BREAKPOINT_MEDIUM) {
    const value = breakpoints[BREAKPOINT_SMALL] + 1
    if (exact) {
      const maxValue = breakpoints[BREAKPOINT_LARGE] - 1
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

  if (name === BREAKPOINT_LARGE) {
    const value = breakpoints[BREAKPOINT_LARGE]
    return {
      value,
      query: `@media (min-width: ${value}px)`
    }
  }

  throw new Error(
    formatError("breakpointNotFound", {
      name,
      available: `${BREAKPOINT_SMALL}, ${BREAKPOINT_MEDIUM}, ${BREAKPOINT_LARGE}`
    })
  )
}
