/**
 * Breakpoint token CSS emitter.
 *
 * Emits the breakpoint axis of flat token groups: per-breakpoint primitives and
 * the `min-width` media blocks that reassign semantic variables to them.
 * Shared by the build (`dist/tokens.css`) and `applyBreakpoints` (runtime
 * re-emission when `setTokens({ breakpoints })` changes thresholds).
 *
 * Phone-first: the semantic variable (e.g. `--np--font-size--large`) holds the
 * phone value and is reassigned at wider viewports. `phone` never gets a media
 * block — it is the base.
 *
 * ## Input
 * The `$breakpoints` data of `src/tokens/modules/*.json`, keyed by breakpoint:
 * `{ phone: { fontSize: { large: "20px" } }, laptop: { fontSize: { large: "24px" } } }`.
 *
 * ## Output
 * - `primitiveLines` — inside `:root`, after the core and component sections:
 *   a phone primitive plus one primitive per overriding breakpoint, for every
 *   variant that has at least one override.
 * - `mediaBlocks` — after `:root`, ascending by breakpoint so wider floors win.
 *   Thresholds are read from `BREAKPOINTS` at call time.
 *
 * @example
 * // output (primitiveLines + one media block)
 * // --np--font-size--large--phone: 20px;
 * // --np--font-size--large--laptop: 24px;
 * // @media (min-width: 1280px) { :root { --np--font-size--large: var(--np--font-size--large--laptop); } }
 */

import { getConstantKey } from '../../services/getConstant.js'
import { camelToKebab } from '../camelToKebab.js'
import { minWidthBlock } from './blocks.js'
import { declarationLine, reassignmentLine } from './declarations.js'
import { BREAKPOINTS, BREAKPOINT_PHONE, SETTABLE_BREAKPOINTS } from '../../constants/breakpoints.js'
import type { DimensionTokens } from './types.js'

/** Lines produced by `generateBreakpointTokenCss`. */
export interface BreakpointTokenCss {
  /** Breakpoint primitive declarations for inside `:root` (with section header) */
  primitiveLines: string[]
  /** `@media (min-width)` blocks for after `:root`, ascending */
  mediaBlocks: string[]
}

/**
 * @param breakpointTokens - Flat token groups keyed by breakpoint
 * @returns Primitive lines and media blocks; both empty when no settable breakpoint overrides anything
 */
export function generateBreakpointTokenCss(breakpointTokens: DimensionTokens): BreakpointTokenCss {
  // Phone values are the base; each settable breakpoint's groups, in breakpoint order
  // (a breakpoint missing from the data contributes no groups)
  const phoneDefaults = breakpointTokens[BREAKPOINT_PHONE] || {}
  const overrides = SETTABLE_BREAKPOINTS.map((breakpoint) => ({ breakpoint, groups: breakpointTokens[breakpoint] || {} }))

  // Only groups overridden above phone need primitives — phone-only values already live in the semantic var
  const overriddenGroups = new Set(overrides.flatMap(({ groups }) => Object.keys(groups)))
  if (overriddenGroups.size === 0) {
    return { primitiveLines: [], mediaBlocks: [] }
  }

  const primitiveLines: string[] = ['', '\t/* Breakpoint primitives */']
  // A line bucket for every settable breakpoint, so reassignments can be pushed without a guard
  const mediaLines: Record<string, string[]> = Object.fromEntries(SETTABLE_BREAKPOINTS.map((bp) => [bp, []]))

  for (const group of overriddenGroups) {
    const cssName = camelToKebab(group)
    // Variants overridden at any settable breakpoint; phone-only variants are skipped
    const variants = new Set(overrides.flatMap(({ groups }) => Object.keys(groups[group] || {})))

    for (const variant of variants) {
      // Phone primitive — the base value the semantic var holds below the first floor
      const phoneValue = phoneDefaults[group]?.[variant]
      if (phoneValue) {
        primitiveLines.push(declarationLine(getConstantKey(cssName, variant, { breakpoint: BREAKPOINT_PHONE }), phoneValue))
      }

      // One primitive + one media reassignment per breakpoint that overrides this variant
      for (const { breakpoint, groups } of overrides) {
        const value = groups[group]?.[variant]
        if (!value) continue
        const primitive = getConstantKey(cssName, variant, { breakpoint })
        primitiveLines.push(declarationLine(primitive, value))
        mediaLines[breakpoint].push(reassignmentLine(getConstantKey(cssName, variant), primitive))
      }
    }
  }

  // Ascending min-width so wider breakpoints win in the cascade; empty buckets emit nothing
  const mediaBlocks = SETTABLE_BREAKPOINTS.flatMap((bp) => minWidthBlock(BREAKPOINTS[bp], mediaLines[bp]))
  return { primitiveLines, mediaBlocks }
}
