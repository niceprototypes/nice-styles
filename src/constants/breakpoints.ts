/**
 * Breakpoint thresholds in pixels.
 *
 * Shared between the runtime getBreakpoint service and build-time
 * CSS generation scripts. Single source of truth for breakpoint values.
 *
 * `BREAKPOINT_PHONE` / `BREAKPOINT_TABLET` / `BREAKPOINT_LAPTOP` /
 * `BREAKPOINT_DESKTOP` are the canonical string identifiers — always
 * import these constants rather than hard-coding the literals.
 *
 * Range layout (phone-first):
 *   phone   : 0      – 640    (max-width query, default — no media query for size tokens)
 *   tablet  : 641    – 1279   (derived range — min-width 641, max-width 1279)
 *   laptop  : 1280   – 1719   (min-width 1280, max-width 1719 when bounded)
 *   desktop : 1720   – ∞      (min-width 1720)
 */
export const BREAKPOINT_PHONE = "phone" as const
export const BREAKPOINT_TABLET = "tablet" as const
export const BREAKPOINT_LAPTOP = "laptop" as const
export const BREAKPOINT_DESKTOP = "desktop" as const

export type BreakpointName =
  | typeof BREAKPOINT_PHONE
  | typeof BREAKPOINT_TABLET
  | typeof BREAKPOINT_LAPTOP
  | typeof BREAKPOINT_DESKTOP

/**
 * Pixel thresholds. `tablet` has no entry — it is the derived range
 * between `phone` (max-width) and `laptop` (min-width).
 */
export const BREAKPOINTS = {
  [BREAKPOINT_PHONE]: 640,
  [BREAKPOINT_LAPTOP]: 1280,
  [BREAKPOINT_DESKTOP]: 1720,
} as const

export type BreakpointValues = typeof BREAKPOINTS