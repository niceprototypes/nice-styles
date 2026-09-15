/**
 * Apply breakpoint thresholds from a token map's `breakpoints` key.
 *
 * Validates the overrides, mutates `BREAKPOINTS` in place (so `getBreakpoint`,
 * `getBreakpointValue`, `breakpointKeyQuery`, and `useBreakpoint` read the new
 * values), and re-emits the generated breakpoint `@media` cascade — core
 * breakpoint tokens and component aliases to them — into
 * `<style data-nice-breakpoints>` with the same emitters the build uses.
 *
 * Settable: `tablet`, `laptop`, `desktop` (positive numbers, ascending).
 * `phone` is the implicit base (everything below `tablet`) and cannot be set.
 */

import breakpointTokensData from '../generated/breakpointTokensData.js'
import componentTokensData from '../generated/componentTokensData.js'
import { generateBreakpointTokenCss } from './breakpointTokenCss.js'
import { buildCoreScopeMap, generateComponentAliasCss } from './componentAliasCss.js'
import { injectBreakpointCss } from './breakpointStyleSheet.js'
import {
  BREAKPOINTS,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointValues,
} from '../constants/breakpoints.js'

const SETTABLE = [BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const
type SettableBreakpoint = typeof SETTABLE[number]

function isSettable(name: string): name is SettableBreakpoint {
  return (SETTABLE as readonly string[]).includes(name)
}

/**
 * @param overrides - `{ tablet?, laptop?, desktop? }` pixel floors
 * @returns true when any threshold changed (and the cascade was re-emitted)
 * @throws on an unknown or non-settable name, a non-positive or non-numeric
 *   value, or thresholds that are not strictly ascending after the merge
 */
export function applyBreakpoints(overrides: Partial<BreakpointValues>): boolean {
  if (typeof overrides !== 'object' || overrides === null || Array.isArray(overrides)) {
    throw new Error('breakpoints: expected an object like { tablet: 700, laptop: 1100 }')
  }

  const next: BreakpointValues = { ...BREAKPOINTS }
  for (const [name, value] of Object.entries(overrides)) {
    if (!isSettable(name)) {
      throw new Error(`breakpoints: "${name}" cannot be set. Settable breakpoints: ${SETTABLE.join(', ')}`)
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`breakpoints: "${name}" must be a positive number of pixels (got ${JSON.stringify(value)})`)
    }
    next[name] = value
  }

  if (!(next[BREAKPOINT_TABLET] < next[BREAKPOINT_LAPTOP] && next[BREAKPOINT_LAPTOP] < next[BREAKPOINT_DESKTOP])) {
    throw new Error(
      `breakpoints: thresholds must ascend tablet < laptop < desktop (got tablet ${next[BREAKPOINT_TABLET]}, laptop ${next[BREAKPOINT_LAPTOP]}, desktop ${next[BREAKPOINT_DESKTOP]})`
    )
  }

  const changed = SETTABLE.some((name) => BREAKPOINTS[name] !== next[name])
  if (!changed) return false

  // Mutate in place — the object reference is shared by every reader.
  for (const name of SETTABLE) BREAKPOINTS[name] = next[name]

  const { mediaBlocks } = generateBreakpointTokenCss(breakpointTokensData)
  const { bpMediaBlocks } = generateComponentAliasCss(
    componentTokensData,
    {},
    {},
    {},
    buildCoreScopeMap({}, breakpointTokensData, {})
  )
  injectBreakpointCss([...mediaBlocks, ...bpMediaBlocks].join('\n'))
  return true
}
