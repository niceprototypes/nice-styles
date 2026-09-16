/**
 * Core token CSS emitter — the day/night axis of one flat token group.
 *
 * Used by `scripts/css/assembleCombined.ts` (every core and inverse group in
 * `dist/tokens.css`) and `scripts/css/assembleIndividual.ts` (`dist/css/{group}.css`).
 *
 * ## Input
 * One group's variants from `src/tokens/modules/*.json` plus its sparse
 * `$themes.night` overrides: `{ base: "#222", light: "#666" }`, `{ base: "#eee" }`.
 *
 * ## Output
 * Every variant gets a semantic declaration. A variant with a night override
 * also gets `--day` / `--night` primitives and the reassignments that switch
 * between them (see `CssEmitResult`).
 *
 * `inverse` appends a trailing `--inverse` segment to every variable (the base
 * group's `$inverse` dimension). Inverse groups carry a full night override, so
 * every inverse variant emits primitives and reassignments.
 *
 * @example
 * generateTokenGroupCss("color", { base: "#222" }, { base: "#eee" })
 * // semanticLines:  ["\t--np--color: #222;"]
 * // dayPrimitives:  ["\t--np--color--day: #222;"]
 * // nightPrimitives:["\t--np--color--night: #eee;"]
 * // nightMediaBody: ["\t\t--np--color: var(--np--color--night);"]
 * // dayPinBody:     ["\t\t--np--color: var(--np--color--day);"]
 */

import { getConstantKey } from '../../services/getConstant.js'
import { declarationLine, reassignmentLine } from './declarations.js'
import type { CssEmitResult } from './types.js'

/**
 * @param cssName - Kebab-case group name (`background-color`)
 * @param variants - Day/base values keyed by variant
 * @param nightVariants - Night overrides keyed by variant (sparse)
 * @param inverse - Emit the group's `--inverse` variables
 */
export function generateTokenGroupCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>,
  inverse = false
): CssEmitResult {
  const result: CssEmitResult = { semanticLines: [], dayPrimitives: [], nightPrimitives: [], nightMediaBody: [], dayPinBody: [] }

  for (const [variant, value] of Object.entries(variants)) {
    const semantic = getConstantKey(cssName, variant, { inverse })
    result.semanticLines.push(declarationLine(semantic, value))

    // Unthemed variants hold one value — no primitives, nothing to reassign
    const nightValue = nightVariants[variant]
    if (!nightValue) continue

    const dayPrimitive = getConstantKey(cssName, variant, { theme: 'day', inverse })
    const nightPrimitive = getConstantKey(cssName, variant, { theme: 'night', inverse })
    result.dayPrimitives.push(declarationLine(dayPrimitive, value))
    result.nightPrimitives.push(declarationLine(nightPrimitive, nightValue))
    result.nightMediaBody.push(reassignmentLine(semantic, nightPrimitive))
    result.dayPinBody.push(reassignmentLine(semantic, dayPrimitive))
  }

  return result
}
