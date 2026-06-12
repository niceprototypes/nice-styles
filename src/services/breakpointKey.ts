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
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointName,
} from '../constants/breakpoints.js'

/** The three range directions a key can express. */
export type BreakpointModifier = 'exact' | 'up' | 'down'

/**
 * A breakpoint key as it appears in a `breakpoints` map or `$breakpoints`
 * object: a bare name, or a name with a `+` (up) / `-` (down) modifier.
 *
 * Edge cases:
 * - `"phone-"` ≡ `"phone"` (phone is the smallest).
 * - `"desktop+"` ≡ `"desktop"` (desktop is the largest).
 * - `"phone+"` and `"desktop-"` both span every breakpoint (base, no @media).
 */
export type BreakpointKey =
  | BreakpointName
  | `${BreakpointName}+`
  | `${BreakpointName}-`

/** A parsed key: its breakpoint name and direction. */
export interface ParsedBreakpointKey {
  name: BreakpointName
  modifier: BreakpointModifier
}

/** Ascending order, smallest → largest. */
const BREAKPOINT_ORDER = [
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
] as const

/** Index of each breakpoint in ascending order (phone=0 … desktop=3). */
const ORDER_INDEX: Record<BreakpointName, number> = {
  [BREAKPOINT_PHONE]: 0,
  [BREAKPOINT_TABLET]: 1,
  [BREAKPOINT_LAPTOP]: 2,
  [BREAKPOINT_DESKTOP]: 3,
}

const BREAKPOINT_COUNT = BREAKPOINT_ORDER.length

/** Narrowing guard for a raw string that may be a breakpoint name. */
export function isBreakpointName(name: string): name is BreakpointName {
  return Object.prototype.hasOwnProperty.call(ORDER_INDEX, name)
}

/**
 * Whether a value is a non-empty plain object whose every key is a breakpoint
 * key (bare name, or name with `+`/`-`). Used to detect the inline breakpoint
 * value-shape in `setTokens` — e.g. `{ "laptop+": "20px", tablet: "16px" }`.
 *
 * Rejects theme values (`{ day, night }` — `day`/`night` are not breakpoint
 * names) and arbitrary objects, so it is safe to test before theme detection.
 */
export function isBreakpointKeyMap(value: unknown): value is Record<string, string | number> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value as Record<string, unknown>)
  if (keys.length === 0) return false
  return keys.every((key) => isBreakpointName(parseBreakpointKey(key).name))
}

/**
 * Split the optional `+`/`-` suffix from a breakpoint key.
 *
 * @example parseBreakpointKey("laptop+") // → { name: "laptop", modifier: "up" }
 */
export function parseBreakpointKey(key: string): ParsedBreakpointKey {
  if (key.endsWith('+')) return { name: key.slice(0, -1) as BreakpointName, modifier: 'up' }
  if (key.endsWith('-')) return { name: key.slice(0, -1) as BreakpointName, modifier: 'down' }
  return { name: key as BreakpointName, modifier: 'exact' }
}

/**
 * Whether a parsed key is active at the current viewport breakpoint.
 *
 * Unknown names never match (the type system prevents them at call sites;
 * a stray runtime key reads as no-match rather than throwing).
 */
export function breakpointKeyMatches(parsed: ParsedBreakpointKey, current: BreakpointName): boolean {
  const target = ORDER_INDEX[parsed.name]
  if (target === undefined) return false

  const currentIdx = ORDER_INDEX[current]
  if (parsed.modifier === 'exact') return currentIdx === target
  if (parsed.modifier === 'up') return currentIdx >= target
  return currentIdx <= target
}

/**
 * Number of breakpoints the key spans (1 … BREAKPOINT_COUNT). Smaller is more
 * specific. exact = 1; up = count − index; down = index + 1.
 */
export function breakpointKeyRangeSize(parsed: ParsedBreakpointKey): number {
  const i = ORDER_INDEX[parsed.name]
  if (i === undefined) return BREAKPOINT_COUNT // unknown → least specific
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
  if (name === BREAKPOINT_PHONE) return BREAKPOINTS[BREAKPOINT_TABLET]
  if (name === BREAKPOINT_TABLET) return BREAKPOINTS[BREAKPOINT_LAPTOP]
  if (name === BREAKPOINT_LAPTOP) return BREAKPOINTS[BREAKPOINT_DESKTOP]
  return Infinity // desktop has no ceiling
}

/**
 * The `@media` query string for a breakpoint key, or `null` when the key spans
 * every viewport (`phone+`, `desktop-`) and therefore belongs in `:root` with
 * no wrapper.
 *
 * - up   → min-width (reuses `getBreakpoint`); `phone+` → null (base).
 * - exact→ the bounded band (reuses `getBreakpoint(name, true)`).
 * - down → max-width at the breakpoint's ceiling; `desktop-` → null (base).
 *
 * Reads `BREAKPOINTS` at call time, so `setBreakpoints` overrides apply.
 */
export function breakpointKeyQuery(key: string): string | null {
  const parsed = parseBreakpointKey(key)
  if (ORDER_INDEX[parsed.name] === undefined) return null

  if (parsed.modifier === 'up') {
    if (parsed.name === BREAKPOINT_PHONE) return null // everything → base
    return getBreakpoint(parsed.name)
  }
  if (parsed.modifier === 'exact') {
    return getBreakpoint(parsed.name, true)
  }
  // down
  if (parsed.name === BREAKPOINT_DESKTOP) return null // everything → base
  return `@media (max-width: ${nextFloor(parsed.name) - 1}px)`
}
