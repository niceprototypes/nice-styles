/**
 * Breakpoints module CSS emitter.
 *
 * Produces breakpoint primitives (inside :root) and @media blocks (outside :root)
 * from the breakpoints module data. Mirrors the modes module pattern:
 *
 * - Color: semantic var → day/night primitives → @media (prefers-color-scheme)
 * - Size:  semantic var → phone/tablet/laptop/desktop primitives → @media (min-width)
 *
 * Phone-first: module.breakpoints.json phone dimension holds the base truth. The semantic
 * variable (e.g., --np--font-size--large) holds the phone value by default and is
 * reassigned to breakpoint primitives via min-width media queries at wider viewports.
 *
 * ## Primitive emission rules
 *
 * For each token group + variant that has a tablet/laptop/desktop override:
 * - Phone primitive always emitted (value from sizeTokens.phone — the base/default)
 * - Tablet primitive emitted when tablet has an override
 * - Laptop primitive emitted when laptop has an override
 * - Desktop primitive emitted when desktop has an override
 *
 * ## Media query rules (phone-first)
 *
 * - Phone:   no media query (semantic variable already holds phone value)
 * - Tablet:  @media (min-width: 641px)  — only if tablet has overrides
 * - Laptop:  @media (min-width: 1280px) — reassigns semantic to laptop primitive
 * - Desktop: @media (min-width: 1720px) — reassigns semantic to desktop primitive
 */

import { getConstantKey } from '../../src/services/getConstant.js'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../../src/constants/breakpoints.js'
import type { BreakpointTokens } from './types.js'

export interface BreakpointEmitResult {
  /** Breakpoint primitive lines for inside :root */
  primitiveLines: string[]
  /** Complete @media blocks for appending after :root */
  mediaBlocks: string[]
}

type BreakpointGroup = Record<string, string>

/**
 * Build a breakpoint primitive line — `\t--np--{cssName}--{variant}--{bp}: {value};`.
 * Used for phone (default) and any override breakpoint.
 */
function buildBreakpointPrimitive(
  cssName: string,
  variant: string,
  breakpoint: string,
  value: string
): string {
  return `\t${getConstantKey(cssName, variant, { breakpoint })}: ${value};`
}

/**
 * Build the @media body line that reassigns the semantic var to a breakpoint primitive.
 */
function buildMediaLine(cssName: string, variant: string, breakpoint: string): string {
  const semantic = getConstantKey(cssName, variant)
  const primitive = getConstantKey(cssName, variant, { breakpoint })
  return `\t\t${semantic}: var(${primitive});`
}

/**
 * Emit override lines for one breakpoint (tablet/laptop/desktop) at one variant:
 * - One primitive line into primitiveLines
 * - One media-body line into mediaLines
 *
 * No-op when the breakpoint has no override at this variant.
 */
function emitOverride(
  cssName: string,
  variant: string,
  breakpoint: string,
  group: BreakpointGroup,
  primitiveLines: string[],
  mediaLines: string[]
): void {
  const value = group[variant]
  if (!value) return
  primitiveLines.push(buildBreakpointPrimitive(cssName, variant, breakpoint, value))
  mediaLines.push(buildMediaLine(cssName, variant, breakpoint))
}

/**
 * Append a wrapped @media (min-width) block to the output. No-op when empty.
 * Each block is preceded by a blank line so the file reads as a stack of sections.
 */
function pushMediaBlock(
  blocks: string[],
  minWidth: number,
  body: string[]
): void {
  if (body.length === 0) return
  blocks.push('')
  blocks.push(`@media (min-width: ${minWidth}px) {`)
  blocks.push('\t:root {')
  blocks.push(...body)
  blocks.push('\t}')
  blocks.push('}')
}

/**
 * Collect the unique set of token-group names that have any tablet/laptop/desktop override.
 * Phone-only groups never need breakpoint primitives — they're already in the semantic value.
 */
function collectOverriddenGroups(
  tablet: BreakpointTokens[string],
  laptop: BreakpointTokens[string],
  desktop: BreakpointTokens[string]
): Set<string> {
  return new Set([
    ...Object.keys(tablet),
    ...Object.keys(laptop),
    ...Object.keys(desktop),
  ])
}

/**
 * Collect the unique set of variants across the three override breakpoints for a single group.
 */
function collectVariantsForGroup(
  tabletGroup: BreakpointGroup,
  laptopGroup: BreakpointGroup,
  desktopGroup: BreakpointGroup
): Set<string> {
  return new Set([
    ...Object.keys(tabletGroup),
    ...Object.keys(laptopGroup),
    ...Object.keys(desktopGroup),
  ])
}

/**
 * Generates breakpoint primitives and @media blocks from the breakpoints module.
 *
 * @param sizeTokens - Breakpoints module data: { phone: {...}, tablet: {...}, laptop: {...}, desktop: {...} }
 */
export function generateBreakpointTokenCss(sizeTokens: BreakpointTokens): BreakpointEmitResult {
  const phoneDefaults = sizeTokens[BREAKPOINT_PHONE] || {}
  const tabletOverrides = sizeTokens[BREAKPOINT_TABLET] || {}
  const laptopOverrides = sizeTokens[BREAKPOINT_LAPTOP] || {}
  const desktopOverrides = sizeTokens[BREAKPOINT_DESKTOP] || {}

  const overriddenGroups = collectOverriddenGroups(tabletOverrides, laptopOverrides, desktopOverrides)
  if (overriddenGroups.size === 0) {
    return { primitiveLines: [], mediaBlocks: [] }
  }

  const primitiveLines: string[] = []
  const tabletMediaLines: string[] = []
  const laptopMediaLines: string[] = []
  const desktopMediaLines: string[] = []

  primitiveLines.push('')
  primitiveLines.push('\t/* Size breakpoint primitives */')

  for (const group of overriddenGroups) {
    const phoneGroup = phoneDefaults[group] || {}
    const tabletGroup = tabletOverrides[group] || {}
    const laptopGroup = laptopOverrides[group] || {}
    const desktopGroup = desktopOverrides[group] || {}
    const cssName = camelToKebab(group)

    for (const variant of collectVariantsForGroup(tabletGroup, laptopGroup, desktopGroup)) {
      // Phone primitive — the base/default value the semantic var holds by default
      const phoneValue = phoneGroup[variant]
      if (phoneValue) {
        primitiveLines.push(buildBreakpointPrimitive(cssName, variant, BREAKPOINT_PHONE, phoneValue))
      }

      emitOverride(cssName, variant, BREAKPOINT_TABLET, tabletGroup, primitiveLines, tabletMediaLines)
      emitOverride(cssName, variant, BREAKPOINT_LAPTOP, laptopGroup, primitiveLines, laptopMediaLines)
      emitOverride(cssName, variant, BREAKPOINT_DESKTOP, desktopGroup, primitiveLines, desktopMediaLines)
    }
  }

  // Assemble @media blocks — phone-first ascending: tablet → laptop → desktop
  const mediaBlocks: string[] = []
  // Tablet threshold is phone + 1px so it activates immediately after the phone band ends
  pushMediaBlock(mediaBlocks, BREAKPOINTS[BREAKPOINT_PHONE] + 1, tabletMediaLines)
  pushMediaBlock(mediaBlocks, BREAKPOINTS[BREAKPOINT_LAPTOP], laptopMediaLines)
  pushMediaBlock(mediaBlocks, BREAKPOINTS[BREAKPOINT_DESKTOP], desktopMediaLines)

  return { primitiveLines, mediaBlocks }
}
