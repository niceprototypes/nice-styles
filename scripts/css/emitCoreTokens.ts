/**
 * Core token CSS emitter.
 *
 * Produces CSS lines for flat (non-nested) core token groups.
 * Each token group has a set of variants, and optionally night overrides.
 *
 * Also provides buildIndividualCss for per-group CSS files (dist/css/*.css).
 */

import { getConstantKey } from '../../src/services/getConstant.js'
import type { CssEmitResult } from './types.js'

/**
 * Build the semantic CSS variable line — `\t--np--{cssName}--{variant}: {value};`
 * (or `…--inverse` for an inverse group). This is the variable components
 * reference; the media query later reassigns it.
 */
function buildSemanticLine(cssName: string, variant: string, value: string, inverse: boolean): string {
  return `\t${getConstantKey(cssName, variant, { inverse })}: ${value};`
}

/**
 * Build the day-theme primitive line — pinned to the day value, never reassigned.
 */
function buildDayPrimitiveLine(cssName: string, variant: string, value: string, inverse: boolean): string {
  return `\t${getConstantKey(cssName, variant, { theme: "day", inverse })}: ${value};`
}

/**
 * Build the night-theme primitive line — pinned to the night value, never reassigned.
 */
function buildNightPrimitiveLine(cssName: string, variant: string, value: string, inverse: boolean): string {
  return `\t${getConstantKey(cssName, variant, { theme: "night", inverse })}: ${value};`
}

/**
 * Build the @media body line that reassigns the semantic var to the night primitive.
 */
function buildNightMediaLine(cssName: string, variant: string, inverse: boolean): string {
  const semantic = getConstantKey(cssName, variant, { inverse })
  const nightPrimitive = getConstantKey(cssName, variant, { theme: "night", inverse })
  return `\t\t${semantic}: var(${nightPrimitive});`
}

/**
 * Generates CSS lines for a single core token group, including mode primitives.
 *
 * For each variant in the token group:
 * - Always emits the semantic variable.
 * - If a night override exists, also emits day/night primitives and a media-body line.
 *
 * `inverse` adds a trailing `--inverse` segment to every variable (the base
 * group's `$inverse` dimension → `--np--color--inverse` /
 * `--day--inverse` / `--night--inverse`). Inverse groups always carry a full
 * night override, so they emit primitives + a media-flip line for every variant.
 */
export function generateTokenGroupCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>,
  inverse = false
): CssEmitResult {
  const semanticLines: string[] = []
  const dayPrimitives: string[] = []
  const nightPrimitives: string[] = []
  const nightMediaBody: string[] = []

  for (const [variantName, value] of Object.entries(variants)) {
    semanticLines.push(buildSemanticLine(cssName, variantName, value, inverse))

    const nightValue = nightVariants[variantName]
    if (nightValue) {
      dayPrimitives.push(buildDayPrimitiveLine(cssName, variantName, value, inverse))
      nightPrimitives.push(buildNightPrimitiveLine(cssName, variantName, nightValue, inverse))
      nightMediaBody.push(buildNightMediaLine(cssName, variantName, inverse))
    }
  }

  return { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody }
}

/**
 * Append a section to the individual-file output: blank line, header comment, body lines.
 * No-op when body is empty so the file stays compact.
 */
function pushSection(lines: string[], header: string, body: string[]): void {
  if (body.length === 0) return
  lines.push('')
  lines.push(header)
  lines.push(...body)
}

/**
 * Builds a single-group CSS file for dist/css/{tokenName}.css.
 * Same structure as the combined file but scoped to one token group.
 */
export function buildIndividualCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>,
  inverseVariants?: Record<string, string>,
  inverseNightVariants?: Record<string, string>
): string {
  // Reuse the same generator as combined CSS — nightMediaBody is discarded here
  // because individual files don't include the opt-in media query
  const { semanticLines, dayPrimitives, nightPrimitives } =
    generateTokenGroupCss(cssName, variants, nightVariants)

  // Inverse dimension (color / backgroundColor) — same group, trailing --inverse.
  const inverse = inverseVariants
    ? generateTokenGroupCss(cssName, inverseVariants, inverseNightVariants ?? {}, true)
    : { semanticLines: [], dayPrimitives: [], nightPrimitives: [] }

  const lines: string[] = []
  lines.push(':root {')
  lines.push(...semanticLines)
  lines.push(...inverse.semanticLines)
  pushSection(lines, '\t/* Day mode primitives */', [...dayPrimitives, ...inverse.dayPrimitives])
  pushSection(lines, '\t/* Night mode primitives */', [...nightPrimitives, ...inverse.nightPrimitives])
  lines.push('}')

  return lines.join('\n')
}
