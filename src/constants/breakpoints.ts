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
 *   phone   : 0      – 640    (the base — no stored threshold; derived as tablet − 1,
 *                              emitted as a max-width query, no media query for breakpoint tokens)
 *   tablet  : 641    – 1279   (min-width 641, max-width 1279 when bounded — editable floor)
 *   laptop  : 1280   – 1719   (min-width 1280, max-width 1719 when bounded — editable floor)
 *   desktop : 1720   – ∞      (min-width 1720 — editable floor)
 *
 * `phone` is the implicit mobile-first base: it has no stored threshold and is
 * not editable — its ceiling tracks `tablet` (the first floor) automatically.
 * The three editable floors (`tablet` / `laptop` / `desktop`) come from
 * `src/tokens/breakpoints.json` via the generated `breakpointsData.ts` file.
 * To change thresholds at build time, edit the JSON source and rebuild.
 */
import breakpointsData from '../generated/breakpointsData.js'

export const BREAKPOINT_PHONE = "phone" as const
export const BREAKPOINT_TABLET = "tablet" as const
export const BREAKPOINT_LAPTOP = "laptop" as const
export const BREAKPOINT_DESKTOP = "desktop" as const

/**
 * Every breakpoint, smallest → largest. The single source of breakpoint order:
 * the name type, the settable breakpoints, range matching, `@media` ceilings,
 * and the generated aliases all derive from it.
 */
export const BREAKPOINT_ORDER = [BREAKPOINT_PHONE, BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const

/** A breakpoint name. */
export type BreakpointName = typeof BREAKPOINT_ORDER[number]

/** A breakpoint with an editable pixel floor — every breakpoint above the `phone` base. */
export type SettableBreakpoint = Exclude<BreakpointName, typeof BREAKPOINT_PHONE>

/** Settable breakpoints in ascending order: `BREAKPOINT_ORDER` without the `phone` base. */
export const SETTABLE_BREAKPOINTS = BREAKPOINT_ORDER.slice(1) as readonly SettableBreakpoint[]

/** Pixel floor per settable breakpoint. */
export type BreakpointValues = Record<SettableBreakpoint, number>

/** Position of `name` in `BREAKPOINT_ORDER`, or -1 when it is not a breakpoint name. */
export function breakpointIndex(name: string): number {
  return (BREAKPOINT_ORDER as readonly string[]).indexOf(name)
}

/**
 * Editable pixel floors. `phone` has no entry — it is the implicit base
 * (everything below `tablet`), so its ceiling is derived as `tablet − 1`.
 *
 * Mutable by design: `setTokens({ breakpoints })` rewrites the object in place so
 * `getBreakpoint`, `getBreakpointValue`, and any other reader pick up
 * the new values without re-importing. The object reference is stable.
 */
export const BREAKPOINTS = Object.fromEntries(
  SETTABLE_BREAKPOINTS.map((name) => [name, breakpointsData[name]])
) as BreakpointValues