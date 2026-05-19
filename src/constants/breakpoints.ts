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
 *   phone   : 0      – 640    (max-width query, default — no media query for breakpoint tokens)
 *   tablet  : 641    – 1279   (derived range — min-width 641, max-width 1279)
 *   laptop  : 1280   – 1719   (min-width 1280, max-width 1719 when bounded)
 *   desktop : 1720   – ∞      (min-width 1720)
 *
 * Numeric values come from `src/tokens/breakpoints.json` via the generated
 * `breakpointsData.ts` file. To change thresholds at build time, edit the
 * JSON source and rebuild.
 */
import breakpointsData from '../generated/breakpointsData.js'

export const BREAKPOINT_PHONE = "phone" as const
export const BREAKPOINT_TABLET = "tablet" as const
export const BREAKPOINT_LAPTOP = "laptop" as const
export const BREAKPOINT_DESKTOP = "desktop" as const

export type BreakpointName =
  | typeof BREAKPOINT_PHONE
  | typeof BREAKPOINT_TABLET
  | typeof BREAKPOINT_LAPTOP
  | typeof BREAKPOINT_DESKTOP

export interface BreakpointValues {
  [BREAKPOINT_PHONE]: number
  [BREAKPOINT_LAPTOP]: number
  [BREAKPOINT_DESKTOP]: number
}

/**
 * Pixel thresholds. `tablet` has no entry — it is the derived range
 * between `phone` (max-width) and `laptop` (min-width).
 *
 * Mutable by design: `setBreakpoints` rewrites the object in place so
 * `getBreakpoint`, `getBreakpointValue`, and any other reader pick up
 * the new values without re-importing. The object reference is stable.
 */
export const BREAKPOINTS: BreakpointValues = {
  [BREAKPOINT_PHONE]: breakpointsData[BREAKPOINT_PHONE],
  [BREAKPOINT_LAPTOP]: breakpointsData[BREAKPOINT_LAPTOP],
  [BREAKPOINT_DESKTOP]: breakpointsData[BREAKPOINT_DESKTOP],
}