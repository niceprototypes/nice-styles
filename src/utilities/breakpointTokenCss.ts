/**
 * Breakpoint token CSS emitter — shared by the build (`dist/tokens.css`) and
 * `applyBreakpoints` (runtime re-emission when `setTokens({ breakpoints })` changes thresholds).
 *
 * Phone-first: the semantic variable (e.g. `--np--font-size--large`) holds the
 * phone value and is reassigned to breakpoint primitives by `min-width` media
 * queries at wider viewports.
 *
 * - Phone primitive: emitted for every variant that has any override.
 * - Tablet / laptop / desktop primitive + media reassignment: emitted where
 *   that breakpoint has an override.
 * - Media blocks ascend tablet → laptop → desktop and read `BREAKPOINTS` at
 *   call time, so runtime threshold overrides apply.
 */

import { getConstantKey } from '../services/getConstant.js'
import { camelToKebab } from './camelToKebab.js'
import { minWidthBlock } from './tokenCss.js'
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../constants/breakpoints.js'

/** Breakpoint-keyed token data: `{ breakpoint: { group: { variant: value } } }`. */
export type BreakpointTokenData = Record<string, Record<string, Record<string, string>>>

export interface BreakpointTokenCss {
  /** Breakpoint primitive lines for inside `:root` */
  primitiveLines: string[]
  /** `@media (min-width)` block lines for after `:root` */
  mediaBlocks: string[]
}

/** Override breakpoints in phone-first ascending order (phone is the base). */
const OVERRIDE_BREAKPOINTS = [BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const

export function generateBreakpointTokenCss(breakpointTokens: BreakpointTokenData): BreakpointTokenCss {
  const phoneDefaults = breakpointTokens[BREAKPOINT_PHONE] || {}
  const overrides = OVERRIDE_BREAKPOINTS.map((breakpoint) => ({ breakpoint, groups: breakpointTokens[breakpoint] || {} }))

  const overriddenGroups = new Set(overrides.flatMap(({ groups }) => Object.keys(groups)))
  if (overriddenGroups.size === 0) {
    return { primitiveLines: [], mediaBlocks: [] }
  }

  const primitiveLines: string[] = ['', '\t/* Breakpoint primitives */']
  const mediaLines: Record<string, string[]> = Object.fromEntries(OVERRIDE_BREAKPOINTS.map((bp) => [bp, []]))

  for (const group of overriddenGroups) {
    const cssName = camelToKebab(group)
    const variants = new Set(overrides.flatMap(({ groups }) => Object.keys(groups[group] || {})))

    for (const variant of variants) {
      const phoneValue = phoneDefaults[group]?.[variant]
      if (phoneValue) {
        primitiveLines.push(`\t${getConstantKey(cssName, variant, { breakpoint: BREAKPOINT_PHONE })}: ${phoneValue};`)
      }

      for (const { breakpoint, groups } of overrides) {
        const value = groups[group]?.[variant]
        if (!value) continue
        const primitive = getConstantKey(cssName, variant, { breakpoint })
        primitiveLines.push(`\t${primitive}: ${value};`)
        mediaLines[breakpoint].push(`\t\t${getConstantKey(cssName, variant)}: var(${primitive});`)
      }
    }
  }

  const mediaBlocks = OVERRIDE_BREAKPOINTS.flatMap((bp) => minWidthBlock(BREAKPOINTS[bp], mediaLines[bp]))
  return { primitiveLines, mediaBlocks }
}
