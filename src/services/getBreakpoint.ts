/**
 * Breakpoint values in pixels
 */
const breakpoints = {
  mobile: 640,
  desktop: 1280
} as const

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
 * Breakpoint names
 * - mobile: max-width query (0 to mobile threshold)
 * - tablet: min-width query (mobile + 1, derived)
 * - desktop: min-width query
 */
export type BreakpointName = "mobile" | "tablet" | "desktop"

/**
 * Get breakpoint value and media query string
 *
 * Returns an object with two properties:
 * - `value`: Breakpoint value in pixels
 * - `query`: Media query string
 *
 * Breakpoint behavior:
 * - `mobile`: Uses max-width (targets screens up to mobile threshold)
 * - `tablet`: Uses min-width of mobile + 1 (derived, targets screens above mobile)
 * - `desktop`: Uses min-width (targets large screens)
 *
 * When `exact` is true, targets only that specific breakpoint range:
 * - `mobile`: max-width only (0 to mobile)
 * - `tablet`: min-width (mobile + 1) AND max-width (desktop - 1)
 * - `desktop`: min-width only (desktop and up)
 *
 * @param name - Breakpoint name ("mobile", "tablet", "desktop")
 * @param exact - If true, targets only this breakpoint range
 * @returns Object containing value and query properties
 * @throws Error if breakpoint name not found
 *
 * @example
 * // Get breakpoint values
 * getBreakpoint("mobile").value  // 440
 * getBreakpoint("tablet").value  // 441 (mobile + 1)
 * getBreakpoint("desktop").value // 1280
 *
 * @example
 * // Get media query strings
 * getBreakpoint("mobile").query  // "@media (max-width: 440px)"
 * getBreakpoint("tablet").query  // "@media (min-width: 441px)"
 * getBreakpoint("desktop").query // "@media (min-width: 1280px)"
 *
 * @example
 * // Exact breakpoint queries (only that range)
 * getBreakpoint("mobile", true).query  // "@media (max-width: 440px)"
 * getBreakpoint("tablet", true).query  // "@media (min-width: 441px) and (max-width: 1279px)"
 * getBreakpoint("desktop", true).query // "@media (min-width: 1280px)"
 *
 * @example
 * // Use in styled-components
 * const Container = styled.div`
 *   width: 100%;
 *
 *   ${getBreakpoint("tablet").query} {
 *     width: 50%;
 *   }
 *
 *   ${getBreakpoint("desktop").query} {
 *     width: 33%;
 *   }
 * `
 */
export function getBreakpoint(name: BreakpointName, exact?: boolean): BreakpointResult {
  if (name === "mobile") {
    const value = breakpoints.mobile
    if (exact) {
      return {
        value,
        query: `@media (max-width: ${value}px)`
      }
    }
    return {
      value,
      query: `@media (max-width: ${value}px)`
    }
  }

  if (name === "tablet") {
    const value = breakpoints.mobile + 1
    if (exact) {
      const maxValue = breakpoints.desktop - 1
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

  if (name === "desktop") {
    const value = breakpoints.desktop
    if (exact) {
      return {
        value,
        query: `@media (min-width: ${value}px)`
      }
    }
    return {
      value,
      query: `@media (min-width: ${value}px)`
    }
  }

  throw new Error(
    `Breakpoint "${name}" not found. ` +
    `Available breakpoints: mobile, tablet, desktop`
  )
}