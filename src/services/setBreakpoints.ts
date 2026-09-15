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

import breakpointTokensData from '../generated/breakpointTokensData.js'
import { buildSizeMediaCss } from '../utilities/buildSizeMediaCss.js'
import { injectBreakpointCss } from '../utilities/breakpointStyleSheet.js'
import { BREAKPOINTS, type BreakpointValues } from '../constants/breakpoints.js'

export function setBreakpoints(breakpoints: Partial<BreakpointValues>): void {
  // Mutate BREAKPOINTS in place so getBreakpoint and other readers see the new values
  const mutable = BREAKPOINTS as unknown as Record<string, number>
  for (const [key, value] of Object.entries(breakpoints)) {
    if (typeof value === 'number' && key in mutable) {
      mutable[key] = value
    }
  }

  injectBreakpointCss(buildSizeMediaCss(breakpointTokensData, BREAKPOINTS))
}
