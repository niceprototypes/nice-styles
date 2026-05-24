/**
 * Combined CSS assembler.
 *
 * Collects output from core and component emitters into a single
 * dist/tokens.css file. Mode awareness — the
 * `@media (prefers-color-scheme: dark)` block plus the `[data-theme]`
 * overrides — is always emitted; per-component overrides (e.g. `mode="day"`)
 * are how consumers opt out at the call site.
 */

import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import type { Tokens, NightTokens, ComponentTokens, BreakpointTokens } from './types.js'
import { generateTokenGroupCss } from './emitCoreTokens.js'
import { generateComponentTokenCss } from './emitComponentTokens.js'
import { generateBreakpointTokenCss } from './emitBreakpointTokens.js'

/**
 * Builds the combined dist/tokens.css containing all token groups.
 *
 * Structure:
 * ```css
 * :root {
 *   color-scheme: light;
 *   --np--{group}--{variant}: {value};             // semantic variables
 *   --np--{group}--{variant}--day: {value};         // day primitives
 *   --np--{group}--{variant}--night: {value};       // night primitives
 *   --np--{prefix}--{token}--{variant}: {value};    // component tokens
 *   --np--{group}--{variant}--small: {value};       // size breakpoint primitives
 *   --np--{group}--{variant}--large: {value};       // size breakpoint primitives
 * }
 *
 * @media (max-width: 640px) {
 *   :root { --np--{group}--{variant}: var(--np--{group}--{variant}--small); }
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
  componentNightTokens: ComponentTokens,
  sizeTokens: BreakpointTokens
): { css: string } {
  // Four accumulators — semantic lines go inline, primitives are batched at the end of :root,
  // and night-media lines accumulate for the trailing @media (prefers-color-scheme: dark) block
  const cssLines: string[] = []
  const allDayPrimitives: string[] = []
  const allNightPrimitives: string[] = []
  const allNightMediaBody: string[] = []

  const pushRootOpen = () => {
    cssLines.push(':root {')
    // Declare support for both schemes — enables native browser dark mode awareness
    cssLines.push('\tcolor-scheme: light dark;')
    cssLines.push('')
  }

  const pushCoreTokenGroups = () => {
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
  }

  const pushDayPrimitives = () => {
    if (allDayPrimitives.length === 0) return
    cssLines.push('')
    cssLines.push('\t/* Day mode primitives */')
    cssLines.push(...allDayPrimitives)
  }

  const pushNightPrimitives = () => {
    if (allNightPrimitives.length === 0) return
    cssLines.push('')
    cssLines.push('\t/* Night mode primitives */')
    cssLines.push(...allNightPrimitives)
  }

  const pushComponentSemantics = (lines: string[]) => {
    if (lines.length === 0) return
    cssLines.push(...lines)
  }

  const pushComponentDayPrimitives = (lines: string[]) => {
    if (lines.length === 0) return
    cssLines.push('')
    cssLines.push('\t/* Component day mode primitives */')
    cssLines.push(...lines)
  }

  const pushComponentNightPrimitives = (lines: string[]) => {
    if (lines.length === 0) return
    cssLines.push('')
    cssLines.push('\t/* Component night mode primitives */')
    cssLines.push(...lines)
  }

  const pushSizePrimitives = (lines: string[]) => {
    if (lines.length === 0) return
    cssLines.push(...lines)
  }

  const pushRootClose = () => {
    cssLines.push('}')
  }

  const pushSizeMediaBlocks = (blocks: string[]) => {
    if (blocks.length === 0) return
    cssLines.push(...blocks)
  }

  const pushColorSchemeMediaBlock = () => {
    if (allNightMediaBody.length === 0) return
    // Mode awareness — reassigns semantic variables to night primitives when OS prefers dark
    cssLines.push('')
    cssLines.push('@media (prefers-color-scheme: dark) {')
    cssLines.push('\t:root {')
    cssLines.push(...allNightMediaBody)
    cssLines.push('\t}')
    cssLines.push('}')

    // Manual pins — [data-theme="day"|"night"] reassigns every semantic mode var to
    // the corresponding primitive on the matched element, cascading to descendants.
    // Attribute selector (specificity 0,1,0,0) outranks the @media :root rule above,
    // so the pin wins regardless of OS preference. Applies to any DOM element —
    // <html data-theme="day"> pins the page; <div data-theme="day">…</div> pins a
    // subtree without other semantics.
    const dayMediaBody = allNightMediaBody.map(line => line.replace(/--night\)/g, '--day)'))
    cssLines.push('')
    cssLines.push('[data-theme="day"] {')
    cssLines.push('\tcolor-scheme: light;')
    cssLines.push(...dayMediaBody)
    cssLines.push('}')
    cssLines.push('')
    cssLines.push('[data-theme="night"] {')
    cssLines.push('\tcolor-scheme: dark;')
    cssLines.push(...allNightMediaBody)
    cssLines.push('}')
  }

  // Phase 1: core token groups — semantic variables go inline, primitives accumulate
  pushRootOpen()
  pushCoreTokenGroups()

  // Phase 2: batched core primitives after all semantic groups
  pushDayPrimitives()
  pushNightPrimitives()

  // Phase 3: component tokens — semantic lines, then dedicated primitive sections
  const componentResult = generateComponentTokenCss(componentTokens, componentNightTokens)
  pushComponentSemantics(componentResult.semanticLines)
  pushComponentDayPrimitives(componentResult.dayPrimitives)
  pushComponentNightPrimitives(componentResult.nightPrimitives)
  // Merge component night-media lines into the shared accumulator for the @media block below
  allNightMediaBody.push(...componentResult.nightMediaBody)

  // Phase 4: size breakpoint primitives — inside :root; media blocks go outside
  const sizeResult = generateBreakpointTokenCss(sizeTokens)
  pushSizePrimitives(sizeResult.primitiveLines)
  pushRootClose()
  pushSizeMediaBlocks(sizeResult.mediaBlocks)

  // Phase 5: mode awareness — @media block + [data-theme] overrides
  pushColorSchemeMediaBlock()

  return { css: cssLines.join('\n') }
}
