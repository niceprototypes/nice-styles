/**
 * Breakpoint thresholds in pixels.
 *
 * Shared between the runtime getBreakpoint service and build-time
 * CSS generation scripts. Single source of truth for breakpoint values.
 *
 * `BREAKPOINT_SMALL` / `BREAKPOINT_MEDIUM` / `BREAKPOINT_LARGE` are the
 * canonical string identifiers — always import these constants rather than
 * hard-coding the literals.
 */
export const BREAKPOINT_SMALL = "small" as const
export const BREAKPOINT_MEDIUM = "medium" as const
export const BREAKPOINT_LARGE = "large" as const

export type BreakpointName =
  | typeof BREAKPOINT_SMALL
  | typeof BREAKPOINT_MEDIUM
  | typeof BREAKPOINT_LARGE

export const BREAKPOINTS = {
  [BREAKPOINT_SMALL]: 640,
  [BREAKPOINT_LARGE]: 1280,
} as const

export type BreakpointValues = typeof BREAKPOINTS
