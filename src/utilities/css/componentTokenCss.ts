/**
 * Component token CSS emitter — the day/night axis of every component token tree.
 *
 * Used by `scripts/css/assembleCombined.ts` for `dist/tokens.css`.
 *
 * ## Input
 * Component base trees keyed by prefix (`src/tokens/components/{prefix}.json`
 * without its `$` axes) and their `$themes.night` partial trees. Each nesting
 * level becomes a `--` segment of the variable name; `base` segments are dropped.
 *
 * ## Output
 * Per prefix, a section header followed by one semantic declaration per leaf.
 * A leaf with a night override at the same path also gets `--day` / `--night`
 * primitives and the reassignments that switch between them (see `CssEmitResult`).
 *
 * @example
 * // input: button { status: { primary: { backgroundColor: "var(--np--color)" } } }
 * // semanticLines: ["", "\t/* button component tokens *\/", "\t--np--button--status--primary--background-color: var(--np--color);"]
 */

import { getConstantKey } from '../../services/getConstant.js'
import { declarationLine, reassignmentLine } from './declarations.js'
import { leafAt, walkTokenTree } from './treeWalk.js'
import type { CssEmitResult, TokenTree } from './types.js'

/**
 * @param componentTokens - Component base trees keyed by prefix
 * @param componentNightTokens - `$themes.night` partial trees keyed by prefix
 * @returns Line arrays for the assembler (see `CssEmitResult`); only `semanticLines` carries section headers
 */
export function generateComponentTokenCss(
  componentTokens: Record<string, TokenTree>,
  componentNightTokens: Record<string, TokenTree>
): CssEmitResult {
  // All prefixes accumulate into one result; the assembler adds the primitive section headers
  const result: CssEmitResult = { semanticLines: [], dayPrimitives: [], nightPrimitives: [], nightMediaBody: [], dayPinBody: [] }

  for (const [prefix, tree] of Object.entries(componentTokens)) {
    // Section header groups each component's semantic lines in the output
    result.semanticLines.push('', `\t/* ${prefix} component tokens */`)

    walkTokenTree(tree, (path, value) => {
      // Every leaf declares its semantic variable. `path` already ends in the
      // variant, so the `base` argument adds no segment
      const semantic = getConstantKey(`${prefix}.${path.join('.')}`)
      result.semanticLines.push(declarationLine(semantic, value))

      // Only leaves with a night override at the same path get primitives
      const nightValue = leafAt(componentNightTokens[prefix], path)
      if (nightValue === undefined) return

      // Day/night primitives plus the reassignments for the theme blocks: night
      // for prefers-color-scheme and the night pin, day for the day pin
      const dayPrimitive = getConstantKey(`${prefix}.${path.join('.')}`, { theme: 'day' })
      const nightPrimitive = getConstantKey(`${prefix}.${path.join('.')}`, { theme: 'night' })
      result.dayPrimitives.push(declarationLine(dayPrimitive, value))
      result.nightPrimitives.push(declarationLine(nightPrimitive, nightValue))
      result.nightMediaBody.push(reassignmentLine(semantic, nightPrimitive))
      result.dayPinBody.push(reassignmentLine(semantic, dayPrimitive))
    })
  }

  return result
}
