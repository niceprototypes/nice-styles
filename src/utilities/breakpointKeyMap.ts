/**
 * Breakpoint key parsing — the pure layer under `services/breakpointKey.ts`.
 *
 * Recognizes breakpoint keys and breakpoint-keyed maps without reading
 * thresholds, so the value classifier (`isStyleValue`) can use it without
 * importing a service. `services/breakpointKey.ts` re-exports everything here
 * as public API.
 *
 * Key grammar: a breakpoint name (`tablet`), optionally followed by `+` (up)
 * or `-` (down).
 */

import { breakpointIndex, type BreakpointName } from '../constants/breakpoints.js'

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

/** Narrowing guard for a raw string that may be a breakpoint name. */
export function isBreakpointName(name: string): name is BreakpointName {
  return breakpointIndex(name) !== -1
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
