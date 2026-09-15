import { formatError } from '../utilities/formatError.js'
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointName,
} from '../constants/breakpoints.js'
// Type-only import — erased at compile time, so no runtime cycle with
// breakpointKey.ts (which imports getBreakpoint as a value).
import type { BreakpointKey, BreakpointModifier } from './breakpointKey.js'

export type { BreakpointName }

/** Ascending order, smallest → largest. */
const ORDER: readonly BreakpointName[] = [
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
]

/**
 * Split the optional `+`/`-` suffix from a breakpoint key into name + direction.
 * Bare = exact band, `+` = up (min-width), `-` = down (max-width). Kept local so
 * `getBreakpoint` carries no upward dependency on `breakpointKey`.
 */
function parseKey(key: string): { name: BreakpointName; modifier: BreakpointModifier } {
  if (key.endsWith('+')) return { name: key.slice(0, -1) as BreakpointName, modifier: 'up' }
  if (key.endsWith('-')) return { name: key.slice(0, -1) as BreakpointName, modifier: 'down' }
  return { name: key as BreakpointName, modifier: 'exact' }
}

function assertKnown(name: BreakpointName): void {
  if (!ORDER.includes(name)) {
    throw new Error(formatError('breakpointNotFound', { name, available: ORDER.join(', ') }))
  }
}

/** Pixel floor of a breakpoint. `phone` is the base (0); the rest read BREAKPOINTS. */
function floorOf(name: BreakpointName): number {
  return name === BREAKPOINT_PHONE ? 0 : BREAKPOINTS[name as keyof typeof BREAKPOINTS]
}

/** Pixel floor of the breakpoint immediately above `name` (Infinity for desktop). */
function nextFloor(name: BreakpointName): number {
  const next = ORDER[ORDER.indexOf(name) + 1]
  return next ? floorOf(next) : Infinity
}

/**
 * Returns the `@media` query string for a breakpoint key.
 *
 * Pass directly into a styled-components template — the `@media` prefix is
 * included in the returned string.
 *
 * Key grammar (smallest → largest: phone < tablet < laptop < desktop), the same
 * `+`/`-`/bare shorthand used by the `breakpoints` prop and setTokens
 * `$breakpoints`:
 * - bare  (`"tablet"`):  exact — only that breakpoint's band (bounded above by
 *   the next floor − 1).
 * - `"+"` (`"tablet+"`): up — that breakpoint and every larger (min-width).
 * - `"-"` (`"tablet-"`): down — that breakpoint and every smaller (max-width at
 *   the band ceiling).
 *
 * Base-spanning keys cover every viewport and so resolve to an always-true query:
 * `"phone+"` → `min-width: 0px`; `"desktop-"` → `min-width: 0px`. (`"phone"`/
 * `"phone-"` are equivalent, as are `"desktop"`/`"desktop+"`.)
 *
 * Reads BREAKPOINTS at call time so `setTokens({ breakpoints })` overrides take effect
 * immediately without re-importing.
 *
 * @example
 * import { getBreakpoint } from "nice-styles"
 *
 * const Container = styled.div`
 *   ${getBreakpoint("tablet+")} {
 *     width: 50%;
 *   }
 * `
 * // → "@media (min-width: 641px) { ... }"
 */
export function getBreakpoint(key: BreakpointKey): string {
  const { name, modifier } = parseKey(key)
  assertKnown(name)

  const floor = floorOf(name)
  const ceiling = nextFloor(name) - 1 // Infinity − 1 stays Infinity

  if (modifier === 'up') {
    return `@media (min-width: ${floor}px)`
  }

  if (modifier === 'down') {
    // No ceiling (desktop-) spans everything → always-true query.
    if (ceiling === Infinity) return `@media (min-width: 0px)`
    return `@media (max-width: ${ceiling}px)`
  }

  // exact band
  if (floor === 0) return `@media (max-width: ${ceiling}px)` // phone — base, max-width only
  if (ceiling === Infinity) return `@media (min-width: ${floor}px)` // desktop — no upper bound
  return `@media (min-width: ${floor}px) and (max-width: ${ceiling}px)`
}

/**
 * Returns the breakpoint threshold in pixels as a raw number. Use when CSS
 * isn't the target — e.g. JS comparisons against `window.innerWidth`, labels
 * in docs, or any consumer that needs the literal number.
 *
 * Takes a bare breakpoint name only (no `+`/`-`): the threshold is a single
 * point, not a range. `phone` has no stored floor, so it returns its ceiling
 * (`tablet − 1`).
 *
 * @example getBreakpointValue("laptop") // → 1280
 */
export function getBreakpointValue(name: BreakpointName): number {
  assertKnown(name)
  if (name === BREAKPOINT_PHONE) return BREAKPOINTS[BREAKPOINT_TABLET] - 1
  return BREAKPOINTS[name as keyof typeof BREAKPOINTS]
}
