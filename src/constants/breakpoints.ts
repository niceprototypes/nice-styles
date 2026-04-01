/**
 * Breakpoint thresholds in pixels.
 *
 * Shared between the runtime getBreakpoint service and build-time
 * CSS generation scripts. Single source of truth for breakpoint values.
 */
export const BREAKPOINTS = {
  mobile: 640,
  desktop: 1280
} as const

export type BreakpointValues = typeof BREAKPOINTS
