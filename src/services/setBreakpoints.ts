/**
 * Setter for breakpoint pixel thresholds.
 *
 * Merges the provided overrides into the runtime breakpoint map and
 * regenerates the responsive @media cascade. Omitted breakpoints are
 * preserved — this is additive, not destructive.
 *
 * @param breakpoints - Override map: { breakpoint: pixelValue }
 *
 * @example
 * setBreakpoints({
 *   laptop: 1100,
 *   desktop: 1800
 * })
 */

import { setBreakpointOverrides } from '../store.js'
import type { BreakpointValues } from '../constants/breakpoints.js'

export function setBreakpoints(breakpoints: Partial<BreakpointValues>): void {
  setBreakpointOverrides(breakpoints)
}
