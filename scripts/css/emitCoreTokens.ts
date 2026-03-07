/**
 * Core token CSS emitter.
 *
 * Produces CSS lines for flat (non-nested) core token groups.
 * Each token group has a set of variants, and optionally night overrides.
 *
 * Also provides buildIndividualCss for per-group CSS files (dist/css/*.css).
 */

import { getConstant } from '../../src/services/getConstant.js'
import type { CssEmitResult } from './types.js'

/**
 * Generates CSS lines for a single core token group, including mode primitives.
 *
 * For each variant in the token group:
 * - Always emits the semantic variable: `--np--{cssName}--{variant}: {value};`
 * - If a night override exists, also emits:
 *   - Day primitive: `--np--{cssName}--{variant}--day: {value};`
 *   - Night primitive: `--np--{cssName}--{variant}--night: {nightValue};`
 *   - Media query reassignment: `--np--{cssName}--{variant}: var(--np--{cssName}--{variant}--night);`
 */
export function generateTokenGroupCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>
): CssEmitResult {
  const semanticLines: string[] = []
  const dayPrimitives: string[] = []
  const nightPrimitives: string[] = []
  const nightMediaBody: string[] = []

  for (const [variantName, value] of Object.entries(variants)) {
    // Semantic variable — the one components reference, reassigned by media query in dark mode
    const cssVar = getConstant(cssName, variantName)
    semanticLines.push(`\t${cssVar.key}: ${value};`)

    if (nightVariants[variantName]) {
      // Day primitive — always resolves to the day (default) value, never reassigned
      const dayCssVar = getConstant(cssName, variantName, { mode: "day" })
      dayPrimitives.push(`\t${dayCssVar.key}: ${value};`)

      // Night primitive — always resolves to the night value, never reassigned
      const nightCssVar = getConstant(cssName, variantName, { mode: "night" })
      nightPrimitives.push(`\t${nightCssVar.key}: ${nightVariants[variantName]};`)

      // Media query entry — reassigns the semantic variable to the night primitive
      nightMediaBody.push(`\t\t${cssVar.key}: var(${nightCssVar.key});`)
    }
  }

  return { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody }
}

/**
 * Builds a single-group CSS file for dist/css/{tokenName}.css.
 * Same structure as the combined file but scoped to one token group.
 */
export function buildIndividualCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>
): string {
  // Reuse the same generator as combined CSS — nightMediaBody is discarded here
  // because individual files don't include the opt-in media query
  const { semanticLines, dayPrimitives, nightPrimitives } =
    generateTokenGroupCss(cssName, variants, nightVariants)

  const lines: string[] = []
  lines.push(':root {')
  lines.push(...semanticLines)

  if (dayPrimitives.length > 0) {
    lines.push('')
    lines.push('\t/* Day mode primitives */')
    lines.push(...dayPrimitives)
  }

  if (nightPrimitives.length > 0) {
    lines.push('')
    lines.push('\t/* Night mode primitives */')
    lines.push(...nightPrimitives)
  }

  lines.push('}')

  return lines.join('\n')
}
