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
import type { Tokens, NightTokens, ComponentTokens, ComponentBreakpointTokens, BreakpointTokens } from './types.js'
import { generateTokenGroupCss } from './emitCoreTokens.js'
import { generateComponentTokenCss } from './emitComponentTokens.js'
import { generateBreakpointTokenCss } from '../../src/utilities/breakpointTokenCss.js'
import { generateComponentBreakpointCss } from './emitComponentBreakpointTokens.js'
import { generateExtraThemeCss, generateComponentExtraThemeCss } from './emitExtraThemeTokens.js'
import { buildCoreScopeMap, generateComponentAliasCss } from '../../src/utilities/componentAliasCss.js'
import { themeBlocks } from '../../src/utilities/tokenCss.js'
import type { TokenNode } from './types.js'

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
  breakpointTokens: BreakpointTokens,
  componentBreakpointTokens: ComponentBreakpointTokens,
  extraThemes: Record<string, Tokens>,
  componentExtraThemes: Record<string, Record<string, { [key: string]: TokenNode }>>,
  inverseTokens: Tokens = {},
  inverseNightTokens: NightTokens = {}
): { css: string } {
  // Three accumulators — semantic lines go inline, primitives are batched at the end of :root,
  // and night-media lines accumulate for the trailing @media (prefers-color-scheme: dark) block
  const cssLines: string[] = []
  const allDayPrimitives: string[] = []
  const allNightPrimitives: string[] = []
  const allNightMediaBody: string[] = []
  const allDayPinBody: string[] = []

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

      const { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody, dayPinBody } =
        generateTokenGroupCss(cssName, tokens[tokenName], nightVariants)

      // Semantic lines go inline per group for visual grouping in the output CSS
      cssLines.push(...semanticLines)
      // Primitives and media body accumulate across all groups for batched output
      allDayPrimitives.push(...dayPrimitives)
      allNightPrimitives.push(...nightPrimitives)
      allNightMediaBody.push(...nightMediaBody)
      allDayPinBody.push(...dayPinBody)

      // Blank line between token groups for readability (except after the last one)
      if (i < tokenNames.length - 1) {
        cssLines.push('')
      }
    }
  }

  // Inverse colors (the `$inverse` dimension) emit under their BASE group name
  // with a trailing `--inverse` segment on every var. Same machinery as themed
  // groups — semantic + day/night primitives + a media flip — so they react to
  // prefers-color-scheme / [data-theme] exactly like normal tokens.
  const pushInverseTokenGroups = () => {
    const inverseGroups = Object.keys(inverseTokens)
    if (inverseGroups.length === 0) return
    cssLines.push('')
    cssLines.push('\t/* Inverse colors */')
    for (const group of inverseGroups) {
      const cssName = camelToKebab(group)
      const nightVariants = inverseNightTokens[group] || {}
      const { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody, dayPinBody } =
        generateTokenGroupCss(cssName, inverseTokens[group], nightVariants, true)
      cssLines.push(...semanticLines)
      allDayPrimitives.push(...dayPrimitives)
      allNightPrimitives.push(...nightPrimitives)
      allNightMediaBody.push(...nightMediaBody)
      allDayPinBody.push(...dayPinBody)
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

  const pushLines = (lines: string[]) => {
    if (lines.length === 0) return
    cssLines.push(...lines)
  }

  const pushRootClose = () => {
    cssLines.push('}')
  }

  const pushColorSchemeMediaBlock = () => {
    // Mode awareness — the OS-preference @media block plus the [data-theme="day"|"night"]
    // pins. A pin on any element reassigns every semantic mode var for that subtree
    // and, being later in source order, wins over the OS-preference block.
    cssLines.push(...themeBlocks(allNightMediaBody, allDayPinBody))
  }

  // Phase 1: core token groups — semantic variables go inline, primitives accumulate
  pushRootOpen()
  pushCoreTokenGroups()
  // Inverse colors fold into the same primitive/media accumulators.
  pushInverseTokenGroups()

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
  allDayPinBody.push(...componentResult.dayPinBody)

  // Auto-propagate bare aliases: any component token whose value is
  // `var(--np--<core>)` tracks every scope the referenced core participates in
  // (theme/night, breakpoints, extra themes), unless an authored override owns
  // that path+scope. Night lines fold into the shared accumulator; breakpoint
  // and extra-theme blocks are appended after :root in Phases 4 and 6.
  const coreScopeMap = buildCoreScopeMap(nightTokens, breakpointTokens, extraThemes)
  const aliasResult = generateComponentAliasCss(
    componentTokens, componentNightTokens, componentBreakpointTokens, componentExtraThemes, coreScopeMap
  )
  allNightMediaBody.push(...aliasResult.nightMediaBody)
  allDayPinBody.push(...aliasResult.dayPinBody)

  // Phase 4: breakpoint primitives — inside :root; media blocks go outside.
  // Module (flat) and component (nested) breakpoints emit the same shape; both
  // primitive sections go inside :root, both media-block stacks go after it.
  const breakpointResult = generateBreakpointTokenCss(breakpointTokens)
  const componentBreakpointResult = generateComponentBreakpointCss(componentTokens, componentBreakpointTokens)
  // Extra (non-night) theme primitives also live inside :root; their pins go in Phase 6.
  const extraThemeResult = generateExtraThemeCss(extraThemes)
  const componentExtraThemeResult = generateComponentExtraThemeCss(componentExtraThemes)
  pushLines(breakpointResult.primitiveLines)
  pushLines(componentBreakpointResult.primitiveLines)
  pushLines(extraThemeResult.primitiveLines)
  pushLines(componentExtraThemeResult.primitiveLines)
  pushRootClose()
  pushLines(breakpointResult.mediaBlocks)
  pushLines(componentBreakpointResult.mediaBlocks)
  // Alias-propagated breakpoint blocks (component tokens aliasing a breakpoint-driven core)
  pushLines(aliasResult.bpMediaBlocks)

  // Phase 5: mode awareness — @media (prefers-color-scheme) + [data-theme="day"|"night"]
  pushColorSchemeMediaBlock()

  // Phase 6: extra-theme pins — one [data-theme="{name}"] block per non-night theme
  pushLines(extraThemeResult.pinBlocks)
  pushLines(componentExtraThemeResult.pinBlocks)
  // Alias-propagated extra-theme pins (component tokens aliasing an extra-themed core)
  pushLines(aliasResult.extraPinBlocks)

  return { css: cssLines.join('\n') }
}
