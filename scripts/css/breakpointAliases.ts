/**
 * Shared breakpoint alias set — the single list every breakpoint CSS asset is
 * generated from, so the `@custom-media` file and the native utility-class file
 * stay in lockstep and both track `src/tokens/breakpoints.json`.
 *
 * Each alias pairs a `name` (the label an emitter formats into a `@custom-media`
 * name or a utility class) with its resolved media-query `condition` (from
 * {@link getBreakpoint}, `@media ` prefix stripped).
 *
 * The alias space mirrors the `name | name+ | name-` breakpoint-key vocabulary:
 * - exact bands: `phone` / `tablet` / `laptop` / `desktop`
 * - up (`+`):    `tablet--up` / `laptop--up` / `desktop--up` (phone+ spans all → omitted)
 * - down (`-`):  `phone--down` / `tablet--down` / `laptop--down` (desktop- spans all → omitted)
 *
 * @module scripts/css/breakpointAliases
 */

import { getBreakpoint } from '../../src/services/getBreakpoint.js'
import {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../../src/constants/breakpoints.js'
import type { BreakpointKey } from '../../src/services/breakpointKey.js'

/** One breakpoint alias: its label and resolved media-query condition. */
export interface BreakpointAlias {
  /** Alias label, `--`-separated (e.g. `tablet`, `tablet--up`, `phone--down`). */
  name: string
  /** Media-query condition, no `@media ` prefix (e.g. `(min-width: 641px)`). */
  condition: string
}

const EXACT_NAMES = [BREAKPOINT_PHONE, BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const
const UP_NAMES = [BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const
const DOWN_NAMES = [BREAKPOINT_PHONE, BREAKPOINT_TABLET, BREAKPOINT_LAPTOP] as const

/** The media-query condition for a key, with the leading `@media ` stripped. */
function condition(key: BreakpointKey): string {
  return getBreakpoint(key).replace(/^@media\s+/, '')
}

/**
 * Build the full ordered alias set (exact bands, then up, then down).
 *
 * @returns One {@link BreakpointAlias} per emitted breakpoint query.
 */
export function breakpointAliases(): BreakpointAlias[] {
  return [
    ...EXACT_NAMES.map((name) => ({ name, condition: condition(name) })),
    ...UP_NAMES.map((name) => ({ name: `${name}--up`, condition: condition(`${name}+` as BreakpointKey) })),
    ...DOWN_NAMES.map((name) => ({ name: `${name}--down`, condition: condition(`${name}-` as BreakpointKey) })),
  ]
}