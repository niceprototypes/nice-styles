import {
  parseBreakpointKey,
  breakpointKeyMatches,
  compareBreakpointSpecificity,
  type ParsedBreakpointKey,
} from '../services/breakpointKey.js'
import type { BreakpointName } from '../constants/breakpoints.js'
import type { BreakpointValue } from '../types/styleValues.js'

/**
 * Resolve a breakpoint value map at one breakpoint.
 *
 * Keys follow the breakpoint key grammar (bare = exact band, `+` = up,
 * `-` = down). Of the keys active at `breakpoint`, the most specific wins —
 * the same rule `withBreakpoints` and the generated @media cascade apply.
 *
 * @example resolveBreakpointValue({ "phone+": "16px", "laptop+": "18px" }, "tablet") // → "16px"
 * @returns The matching value, or undefined when no key covers `breakpoint`.
 */
export function resolveBreakpointValue(
  value: BreakpointValue,
  breakpoint: BreakpointName
): string | number | undefined {
  let best: { parsed: ParsedBreakpointKey; value: string | number } | undefined
  for (const [key, entry] of Object.entries(value)) {
    const parsed = parseBreakpointKey(key)
    if (!breakpointKeyMatches(parsed, breakpoint)) continue
    if (!best || compareBreakpointSpecificity(parsed, best.parsed) > 0) {
      best = { parsed, value: entry }
    }
  }
  return best?.value
}
