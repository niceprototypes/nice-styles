/**
 * Size module CSS emitter.
 *
 * Produces breakpoint primitives (inside :root) and @media blocks (outside :root)
 * from the size module data. Mirrors the color module pattern:
 *
 * - Color: semantic var → day/night primitives → @media (prefers-color-scheme)
 * - Size:  semantic var → phone/tablet/laptop/desktop primitives → @media (min-width)
 *
 * Phone-first: module.size.json phone dimension holds the base truth. The semantic
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

import { getConstant } from '../../src/services/getConstant.js'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../../src/constants/breakpoints.js'
import type { SizeTokens } from './types.js'

export interface SizeEmitResult {
  /** Breakpoint primitive lines for inside :root */
  primitiveLines: string[]
  /** Complete @media blocks for appending after :root */
  mediaBlocks: string[]
}

/**
 * Generates breakpoint primitives and @media blocks from the size module.
 *
 * @param sizeTokens - Size module data: { phone: {...}, tablet: {...}, laptop: {...}, desktop: {...} }
 */
export function generateSizeTokenCss(
  sizeTokens: SizeTokens
): SizeEmitResult {
  const primitiveLines: string[] = []
  const tabletMediaLines: string[] = []
  const laptopMediaLines: string[] = []
  const desktopMediaLines: string[] = []

  const phoneDefaults = sizeTokens[BREAKPOINT_PHONE] || {}
  const tabletOverrides = sizeTokens[BREAKPOINT_TABLET] || {}
  const laptopOverrides = sizeTokens[BREAKPOINT_LAPTOP] || {}
  const desktopOverrides = sizeTokens[BREAKPOINT_DESKTOP] || {}

  const allGroups = new Set([
    ...Object.keys(tabletOverrides),
    ...Object.keys(laptopOverrides),
    ...Object.keys(desktopOverrides),
  ])

  if (allGroups.size === 0) {
    return { primitiveLines: [], mediaBlocks: [] }
  }

  primitiveLines.push('')
  primitiveLines.push('\t/* Size breakpoint primitives */')

  for (const group of allGroups) {
    const phoneGroup = phoneDefaults[group] || {}
    const tabletGroup = tabletOverrides[group] || {}
    const laptopGroup = laptopOverrides[group] || {}
    const desktopGroup = desktopOverrides[group] || {}
    const cssName = camelToKebab(group)

    const allVariants = new Set([
      ...Object.keys(tabletGroup),
      ...Object.keys(laptopGroup),
      ...Object.keys(desktopGroup),
    ])

    for (const variant of allVariants) {
      const phoneValue = phoneGroup[variant]

      if (phoneValue) {
        const phonePrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_PHONE })
        primitiveLines.push(`\t${phonePrimitive.key}: ${phoneValue};`)
      }

      if (tabletGroup[variant]) {
        const tabletPrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_TABLET })
        primitiveLines.push(`\t${tabletPrimitive.key}: ${tabletGroup[variant]};`)
        const semanticVar = getConstant(cssName, variant)
        tabletMediaLines.push(`\t\t${semanticVar.key}: var(${tabletPrimitive.key});`)
      }

      if (laptopGroup[variant]) {
        const laptopPrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_LAPTOP })
        primitiveLines.push(`\t${laptopPrimitive.key}: ${laptopGroup[variant]};`)
        const semanticVar = getConstant(cssName, variant)
        laptopMediaLines.push(`\t\t${semanticVar.key}: var(${laptopPrimitive.key});`)
      }

      if (desktopGroup[variant]) {
        const desktopPrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_DESKTOP })
        primitiveLines.push(`\t${desktopPrimitive.key}: ${desktopGroup[variant]};`)
        const semanticVar = getConstant(cssName, variant)
        desktopMediaLines.push(`\t\t${semanticVar.key}: var(${desktopPrimitive.key});`)
      }
    }
  }

  // Assemble @media blocks — phone-first ascending: tablet → laptop → desktop
  const mediaBlocks: string[] = []

  if (tabletMediaLines.length > 0) {
    const tabletMin = BREAKPOINTS[BREAKPOINT_PHONE] + 1
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${tabletMin}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...tabletMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  if (laptopMediaLines.length > 0) {
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${BREAKPOINTS[BREAKPOINT_LAPTOP]}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...laptopMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  if (desktopMediaLines.length > 0) {
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${BREAKPOINTS[BREAKPOINT_DESKTOP]}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...desktopMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  return { primitiveLines, mediaBlocks }
}