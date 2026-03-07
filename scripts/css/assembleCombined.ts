/**
 * Combined CSS assembler.
 *
 * Collects output from core and component emitters into a single
 * dist/variables.css file. Does NOT include the auto dark mode
 * media query — that lives in color-scheme.css.
 *
 * Returns the assembled CSS string and the collected nightMediaBody
 * lines (the bridge to assembleColorScheme).
 */

import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import type { Tokens, NightTokens, ComponentTokens } from './types.js'
import { generateTokenGroupCss } from './emitCoreTokens.js'
import { generateComponentTokenCss } from './emitComponentTokens.js'

/**
 * Builds the combined dist/variables.css containing all token groups.
 *
 * Structure:
 * ```css
 * :root {
 *   color-scheme: light;
 *   --np--{group}--{variant}: {value};         // semantic variables
 *   --np--{group}--{variant}--day: {value};     // day primitives
 *   --np--{group}--{variant}--night: {value};   // night primitives
 *   --np--{prefix}--{token}--{variant}: {value}; // component tokens
 * }
 * ```
 *
 * Returns the CSS string and the collected night media body lines
 * (used by assembleColorSchemeCss to produce the opt-in file).
 */
export function buildCombinedCss(
  tokens: Tokens,
  nightTokens: NightTokens,
  componentTokens: ComponentTokens,
  componentNightTokens: ComponentTokens
): { css: string; nightMediaBody: string[] } {
  // Four accumulators — semantic lines go inline, primitives are batched at the end of :root,
  // and nightMediaBody is returned for color-scheme.css to consume separately
  const cssLines: string[] = []
  const allDayPrimitives: string[] = []
  const allNightPrimitives: string[] = []
  const allNightMediaBody: string[] = []

  cssLines.push(':root {')
  // Default to light — color-scheme.css overrides this to "light dark" when auto dark mode is enabled
  cssLines.push('\tcolor-scheme: light;')
  cssLines.push('')

  // Phase 1: Generate core token groups — semantic variables go inline, primitives accumulate
  const tokenNames = Object.keys(tokens)

  for (let i = 0; i < tokenNames.length; i++) {
    const tokenName = tokenNames[i]
    const cssName = camelToKebab(tokenName)
    // Fall back to empty if this group has no night overrides
    const nightVariants = nightTokens[tokenName] || {}

    const { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody } =
      generateTokenGroupCss(cssName, tokens[tokenName], nightVariants)

    // Semantic lines go inline per group for visual grouping in the output CSS
    cssLines.push(...semanticLines)
    // Primitives and media body accumulate across all groups for batched output
    allDayPrimitives.push(...dayPrimitives)
    allNightPrimitives.push(...nightPrimitives)
    allNightMediaBody.push(...nightMediaBody)

    // Blank line between token groups for readability (except after the last one)
    if (i < tokenNames.length - 1) {
      cssLines.push('')
    }
  }

  // Phase 2: Append batched core primitives after all semantic groups
  if (allDayPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Day mode primitives */')
    cssLines.push(...allDayPrimitives)
  }

  if (allNightPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Night mode primitives */')
    cssLines.push(...allNightPrimitives)
  }

  // Phase 3: Generate component tokens and append after core
  const componentResult = generateComponentTokenCss(componentTokens, componentNightTokens)
  if (componentResult.semanticLines.length > 0) {
    cssLines.push(...componentResult.semanticLines)
  }

  // Component primitives are kept separate from core primitives with their own section headers
  if (componentResult.dayPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Component day mode primitives */')
    cssLines.push(...componentResult.dayPrimitives)
  }

  if (componentResult.nightPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Component night mode primitives */')
    cssLines.push(...componentResult.nightPrimitives)
  }

  // Merge component media body into the shared accumulator — color-scheme.css gets one combined block
  allNightMediaBody.push(...componentResult.nightMediaBody)

  cssLines.push('}')

  return { css: cssLines.join('\n'), nightMediaBody: allNightMediaBody }
}
