/**
 * breakpointKey — shared parsing, matching, specificity, and @media-query
 * resolution for breakpoint keys with optional `+`/`-` range modifiers.
 *
 * One source of truth for both consumers of the shorthand:
 * - `withBreakpoints` (nice-react-styles) — render-time prop merging, uses
 *   `parseBreakpointKey` + `breakpointKeyMatches` + `compareBreakpointSpecificity`.
 * - `generateTokenCSS` / `setTokens` (nice-styles) — CSS emission, uses
 *   `breakpointKeyQuery` + `compareBreakpointSpecificity` to order @media blocks.
 *
 * Key grammar (smallest → largest: phone < tablet < laptop < desktop):
 * - bare  (`"tablet"`):  exact — only this breakpoint's band.
 * - `"+"` (`"tablet+"`): up — this breakpoint and every larger (min-width).
 * - `"-"` (`"tablet-"`): down — this breakpoint and every smaller (max-width).
 *
 * Specificity (most specific first): smaller range wins; at equal range size,
 * direction breaks the tie — exact, then down, then up. The comparator sorts
 * LEAST → MOST specific so the most specific is applied/emitted last and wins
 * (by fold-merge order in JS, by CSS source order in the cascade).
 */
import { getBreakpoint } from './getBreakpoint.js'
import { parseBreakpointKey, type BreakpointModifier, type ParsedBreakpointKey } from '../utilities/breakpointKeyMap.js'
import {
  BREAKPOINTS,
  BREAKPOINT_ORDER,
  BREAKPOINT_PHONE,
  BREAKPOINT_DESKTOP,
  breakpointIndex,
  type BreakpointName,
  type SettableBreakpoint,
} from '../constants/breakpoints.js'

// Parsing and recognition live in utilities (no threshold reads); public API from here.
export { isBreakpointName, isBreakpointKeyMap, parseBreakpointKey } from '../utilities/breakpointKeyMap.js'
export type { BreakpointKey, BreakpointModifier, ParsedBreakpointKey } from '../utilities/breakpointKeyMap.js'

const BREAKPOINT_COUNT = BREAKPOINT_ORDER.length

/**
 * Whether a parsed key is active at the current viewport breakpoint.
 *
 * Unknown names never match (the type system prevents them at call sites;
 * a stray runtime key reads as no-match rather than throwing).
 */
export function breakpointKeyMatches(parsed: ParsedBreakpointKey, current: BreakpointName): boolean {
  const target = breakpointIndex(parsed.name)
  if (target === -1) return false

  const currentIdx = breakpointIndex(current)
  if (parsed.modifier === 'exact') return currentIdx === target
  if (parsed.modifier === 'up') return currentIdx >= target
  return currentIdx <= target
}

/**
 * Number of breakpoints the key spans (1 … BREAKPOINT_COUNT). Smaller is more
 * specific. exact = 1; up = count − index; down = index + 1.
 */
export function breakpointKeyRangeSize(parsed: ParsedBreakpointKey): number {
  const i = breakpointIndex(parsed.name)
  if (i === -1) return BREAKPOINT_COUNT // unknown → least specific
  if (parsed.modifier === 'exact') return 1
  if (parsed.modifier === 'up') return BREAKPOINT_COUNT - i
  return i + 1 // down
}

/** Direction tie-break rank — exact most specific, then down, then up. */
const DIRECTION_RANK: Record<BreakpointModifier, number> = { exact: 0, down: 1, up: 2 }

/**
 * Specificity comparator. Sorts LEAST → MOST specific, so applying/emitting in
 * sorted order lets the most specific match land last and win — by fold-merge
 * order in JS, by CSS source order in the cascade.
 *
 * Primary key: larger range first (less specific). Tie: higher direction rank
 * first (up before down before exact). Two matching keys never share both size
 * and direction (that would require the same name, i.e. the same key).
 */
export function compareBreakpointSpecificity(a: ParsedBreakpointKey, b: ParsedBreakpointKey): number {
  const sizeA = breakpointKeyRangeSize(a)
  const sizeB = breakpointKeyRangeSize(b)
  if (sizeA !== sizeB) return sizeB - sizeA
  return DIRECTION_RANK[b.modifier] - DIRECTION_RANK[a.modifier]
}

/** Pixel floor of the breakpoint immediately above `name` (Infinity for desktop). */
function nextFloor(name: BreakpointName): number {
  // The breakpoint after `name` is always settable (phone is first); desktop has none.
  const next = BREAKPOINT_ORDER[breakpointIndex(name) + 1] as SettableBreakpoint | undefined
  return next ? BREAKPOINTS[next] : Infinity
}

/**
 * The `@media` query string for a breakpoint key, or `null` when the key spans
 * every viewport (`phone+`, `desktop-`) and therefore belongs in `:root` with
 * no wrapper.
 *
 * - up   → min-width (reuses `getBreakpoint("name+")`); `phone+` → null (base).
 * - exact→ the bounded band (reuses `getBreakpoint("name")`).
 * - down → max-width at the breakpoint's ceiling; `desktop-` → null (base).
 *
 * Reads `BREAKPOINTS` at call time, so `setTokens({ breakpoints })` overrides apply.
 */
export function breakpointKeyQuery(key: string): string | null {
  const parsed = parseBreakpointKey(key)
  if (breakpointIndex(parsed.name) === -1) return null

  if (parsed.modifier === 'up') {
    if (parsed.name === BREAKPOINT_PHONE) return null // everything → base
    return getBreakpoint(`${parsed.name}+`)
  }
  if (parsed.modifier === 'exact') {
    return getBreakpoint(parsed.name)
  }
  // down
  if (parsed.name === BREAKPOINT_DESKTOP) return null // everything → base
  return `@media (max-width: ${nextFloor(parsed.name) - 1}px)`
}
