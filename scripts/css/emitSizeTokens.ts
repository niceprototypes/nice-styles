/**
 * Size module CSS emitter.
 *
 * Produces breakpoint primitives (inside :root) and @media blocks (outside :root)
 * from the size module data. Mirrors the color module pattern:
 *
 * - Color: semantic var → day/night primitives → @media (prefers-color-scheme)
 * - Size:  semantic var → mobile/tablet/desktop primitives → @media (min-width)
 *
 * Mobile-first: module.size.json mobile dimension holds the base truth. The semantic
 * variable (e.g., --np--font-size--large) holds the mobile value by default and is
 * reassigned to breakpoint primitives via min-width media queries at wider viewports.
 *
 * ## Primitive emission rules
 *
 * For each token group + variant that has a tablet or desktop override:
 * - Mobile primitive always emitted (value from sizeTokens.mobile — the base/default)
 * - Tablet primitive emitted when tablet has an override
 * - Desktop primitive emitted when desktop has an override
 *
 * ## Media query rules (mobile-first)
 *
 * - Mobile: no media query (semantic variable already holds mobile value)
 * - Tablet: @media (min-width: 641px) — only if tablet has overrides
 * - Desktop: @media (min-width: 1280px) — reassigns semantic to desktop primitive
 */

import { getConstant } from '../../src/services/getConstant.js'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import { BREAKPOINTS } from '../../src/constants/breakpoints.js'
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
 * @param sizeTokens - Size module data: { mobile: { group: { item: value } }, tablet: {...}, desktop: {...} }
 */
export function generateSizeTokenCss(
  sizeTokens: SizeTokens
): SizeEmitResult {
  const primitiveLines: string[] = []
  const tabletMediaLines: string[] = []
  const desktopMediaLines: string[] = []

  const mobileDefaults = sizeTokens.mobile || {}
  const tabletOverrides = sizeTokens.tablet || {}
  const desktopOverrides = sizeTokens.desktop || {}

  // Collect all token groups that have any breakpoint override
  const allGroups = new Set([
    ...Object.keys(tabletOverrides),
    ...Object.keys(desktopOverrides)
  ])

  if (allGroups.size === 0) {
    return { primitiveLines: [], mediaBlocks: [] }
  }

  primitiveLines.push('')
  primitiveLines.push('\t/* Size breakpoint primitives */')

  for (const group of allGroups) {
    const mobileGroup = mobileDefaults[group] || {}
    const tabletGroup = tabletOverrides[group] || {}
    const desktopGroup = desktopOverrides[group] || {}
    const cssName = camelToKebab(group)

    // Collect all variants that have any override
    const allVariants = new Set([
      ...Object.keys(tabletGroup),
      ...Object.keys(desktopGroup)
    ])

    for (const variant of allVariants) {
      const mobileValue = mobileGroup[variant]

      // Mobile primitive — always emitted (value from sizeTokens.mobile, the base/default)
      if (mobileValue) {
        const mobilePrimitive = getConstant(cssName, variant, { breakpoint: 'mobile' })
        primitiveLines.push(`\t${mobilePrimitive.key}: ${mobileValue};`)
      }

      // Tablet primitive — emitted when tablet has an override
      if (tabletGroup[variant]) {
        const tabletPrimitive = getConstant(cssName, variant, { breakpoint: 'tablet' })
        primitiveLines.push(`\t${tabletPrimitive.key}: ${tabletGroup[variant]};`)

        // Media query entry — reassigns semantic variable to tablet primitive
        const semanticVar = getConstant(cssName, variant)
        tabletMediaLines.push(`\t\t${semanticVar.key}: var(${tabletPrimitive.key});`)
      }

      // Desktop primitive — emitted when desktop has an override
      if (desktopGroup[variant]) {
        const desktopPrimitive = getConstant(cssName, variant, { breakpoint: 'desktop' })
        primitiveLines.push(`\t${desktopPrimitive.key}: ${desktopGroup[variant]};`)

        // Media query entry — reassigns semantic variable to desktop primitive
        const semanticVar = getConstant(cssName, variant)
        desktopMediaLines.push(`\t\t${semanticVar.key}: var(${desktopPrimitive.key});`)
      }
    }
  }

  // Assemble @media blocks — mobile-first, so tablet then desktop
  const mediaBlocks: string[] = []

  if (tabletMediaLines.length > 0) {
    const tabletMin = BREAKPOINTS.mobile + 1
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${tabletMin}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...tabletMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  if (desktopMediaLines.length > 0) {
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${BREAKPOINTS.desktop}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...desktopMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  return { primitiveLines, mediaBlocks }
}
