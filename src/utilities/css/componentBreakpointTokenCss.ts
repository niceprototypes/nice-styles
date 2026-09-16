/**
 * Component breakpoint CSS emitter — the breakpoint axis of every component token tree.
 *
 * The nested-tree counterpart of `breakpointTokenCss.ts`. Phone-first: the
 * component's base value is the phone value, already held by the semantic
 * variable (`componentTokenCss.ts`); wider breakpoints reassign it through
 * `min-width` media blocks.
 *
 * Used by `scripts/css/assembleCombined.ts` for `dist/tokens.css`.
 *
 * ## Input
 * Component base trees keyed by prefix, and `$breakpoints` partial trees keyed
 * by prefix, then breakpoint.
 *
 * ## Output
 * - `primitiveLines` — inside `:root`: for each leaf with any override, a phone
 *   primitive (the base value) plus one primitive per overriding breakpoint.
 * - `mediaBlocks` — after `:root`, ascending by breakpoint. Thresholds are read
 *   from `BREAKPOINTS` at call time.
 *
 * @example
 * // input: tile { gap: "8px" }, $breakpoints.laptop { gap: "16px" }
 * // primitiveLines: ["", "\t/* Component breakpoint primitives *\/", "\t--np--tile--gap--phone: 8px;", "\t--np--tile--gap--laptop: 16px;"]
 * // mediaBlocks:    @media (min-width: 1280px) { :root { --np--tile--gap: var(--np--tile--gap--laptop); } }
 */

import { getConstantKey } from '../../services/getConstant.js'
import { minWidthBlock } from './blocks.js'
import { declarationLine, reassignmentLine } from './declarations.js'
import { leafAt, walkTokenTree } from './treeWalk.js'
import { BREAKPOINTS, BREAKPOINT_PHONE, SETTABLE_BREAKPOINTS } from '../../constants/breakpoints.js'
import type { TokenTree } from './types.js'

/** Lines produced by `generateComponentBreakpointCss`. */
export interface ComponentBreakpointCss {
  /** Breakpoint primitive declarations for inside `:root` (with section header) */
  primitiveLines: string[]
  /** `@media (min-width)` blocks for after `:root`, ascending */
  mediaBlocks: string[]
}

/**
 * @param componentTokens - Component base trees keyed by prefix (the phone values)
 * @param componentBreakpointTokens - `$breakpoints` partial trees keyed by prefix, then breakpoint
 * @returns Primitive lines and media blocks; both empty when no component leaf has an override
 */
export function generateComponentBreakpointCss(
  componentTokens: Record<string, TokenTree>,
  componentBreakpointTokens: Record<string, Record<string, TokenTree>>
): ComponentBreakpointCss {
  const primitiveLines: string[] = []
  // A line bucket for every settable breakpoint, so reassignments can be pushed without a guard
  const mediaLines: Record<string, string[]> = Object.fromEntries(SETTABLE_BREAKPOINTS.map((bp) => [bp, []]))

  for (const [prefix, tree] of Object.entries(componentTokens)) {
    // Components without `$breakpoints` emit nothing here
    const byBreakpoint = componentBreakpointTokens[prefix]
    if (!byBreakpoint) continue

    // Walk the base tree (not the overrides), so every override is paired with its base value
    walkTokenTree(tree, (path, value) => {
      // Overrides of this leaf, in breakpoint order; a leaf without any is skipped
      const overrides = SETTABLE_BREAKPOINTS
        .map((breakpoint) => ({ breakpoint, value: leafAt(byBreakpoint[breakpoint], path) }))
        .filter((override): override is { breakpoint: typeof override.breakpoint; value: string } => override.value !== undefined)
      if (overrides.length === 0) return

      // Phone primitive — the base value the semantic var holds below the first floor
      primitiveLines.push(declarationLine(getConstantKey(`${prefix}.${path.join('.')}`, { breakpoint: BREAKPOINT_PHONE }), value))

      // One primitive + one media reassignment per overriding breakpoint
      const semantic = getConstantKey(`${prefix}.${path.join('.')}`)
      for (const override of overrides) {
        const primitive = getConstantKey(`${prefix}.${path.join('.')}`, { breakpoint: override.breakpoint })
        primitiveLines.push(declarationLine(primitive, override.value))
        mediaLines[override.breakpoint].push(reassignmentLine(semantic, primitive))
      }
    })
  }

  // Section header only when something was emitted — known only after the walk, hence unshift
  if (primitiveLines.length > 0) primitiveLines.unshift('', '\t/* Component breakpoint primitives */')

  // Ascending min-width so wider breakpoints win in the cascade; empty buckets emit nothing
  const mediaBlocks = SETTABLE_BREAKPOINTS.flatMap((bp) => minWidthBlock(BREAKPOINTS[bp], mediaLines[bp]))
  return { primitiveLines, mediaBlocks }
}
