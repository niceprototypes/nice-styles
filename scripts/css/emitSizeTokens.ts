/**
 * Size module CSS emitter.
 *
 * Produces breakpoint primitives (inside :root) and @media blocks (outside :root)
 * from the size module data. Mirrors the color module pattern:
 *
 * - Color: semantic var → day/night primitives → @media (prefers-color-scheme)
 * - Size:  semantic var → small/medium/large primitives → @media (min-width)
 *
 * Small-first: module.size.json small dimension holds the base truth. The semantic
 * variable (e.g., --np--font-size--large) holds the small value by default and is
 * reassigned to breakpoint primitives via min-width media queries at wider viewports.
 *
 * ## Primitive emission rules
 *
 * For each token group + variant that has a medium or large override:
 * - Small primitive always emitted (value from sizeTokens.small — the base/default)
 * - Medium primitive emitted when medium has an override
 * - Large primitive emitted when large has an override
 *
 * ## Media query rules (small-first)
 *
 * - Small: no media query (semantic variable already holds small value)
 * - Medium: @media (min-width: 641px) — only if medium has overrides
 * - Large: @media (min-width: 1280px) — reassigns semantic to large primitive
 */

import { getConstant } from '../../src/services/getConstant.js'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import {
  BREAKPOINTS,
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_LARGE,
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
 * @param sizeTokens - Size module data: { small: { group: { item: value } }, medium: {...}, large: {...} }
 */
export function generateSizeTokenCss(
  sizeTokens: SizeTokens
): SizeEmitResult {
  const primitiveLines: string[] = []
  const mediumMediaLines: string[] = []
  const largeMediaLines: string[] = []

  const smallDefaults = sizeTokens[BREAKPOINT_SMALL] || {}
  const mediumOverrides = sizeTokens[BREAKPOINT_MEDIUM] || {}
  const largeOverrides = sizeTokens[BREAKPOINT_LARGE] || {}

  // Collect all token groups that have any breakpoint override
  const allGroups = new Set([
    ...Object.keys(mediumOverrides),
    ...Object.keys(largeOverrides)
  ])

  if (allGroups.size === 0) {
    return { primitiveLines: [], mediaBlocks: [] }
  }

  primitiveLines.push('')
  primitiveLines.push('\t/* Size breakpoint primitives */')

  for (const group of allGroups) {
    const smallGroup = smallDefaults[group] || {}
    const mediumGroup = mediumOverrides[group] || {}
    const largeGroup = largeOverrides[group] || {}
    const cssName = camelToKebab(group)

    // Collect all variants that have any override
    const allVariants = new Set([
      ...Object.keys(mediumGroup),
      ...Object.keys(largeGroup)
    ])

    for (const variant of allVariants) {
      const smallValue = smallGroup[variant]

      // Small primitive — always emitted (value from sizeTokens.small, the base/default)
      if (smallValue) {
        const smallPrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_SMALL })
        primitiveLines.push(`\t${smallPrimitive.key}: ${smallValue};`)
      }

      // Medium primitive — emitted when medium has an override
      if (mediumGroup[variant]) {
        const mediumPrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_MEDIUM })
        primitiveLines.push(`\t${mediumPrimitive.key}: ${mediumGroup[variant]};`)

        // Media query entry — reassigns semantic variable to medium primitive
        const semanticVar = getConstant(cssName, variant)
        mediumMediaLines.push(`\t\t${semanticVar.key}: var(${mediumPrimitive.key});`)
      }

      // Large primitive — emitted when large has an override
      if (largeGroup[variant]) {
        const largePrimitive = getConstant(cssName, variant, { breakpoint: BREAKPOINT_LARGE })
        primitiveLines.push(`\t${largePrimitive.key}: ${largeGroup[variant]};`)

        // Media query entry — reassigns semantic variable to large primitive
        const semanticVar = getConstant(cssName, variant)
        largeMediaLines.push(`\t\t${semanticVar.key}: var(${largePrimitive.key});`)
      }
    }
  }

  // Assemble @media blocks — small-first, so medium then large
  const mediaBlocks: string[] = []

  if (mediumMediaLines.length > 0) {
    const mediumMin = BREAKPOINTS[BREAKPOINT_SMALL] + 1
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${mediumMin}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...mediumMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  if (largeMediaLines.length > 0) {
    mediaBlocks.push('')
    mediaBlocks.push(`@media (min-width: ${BREAKPOINTS[BREAKPOINT_LARGE]}px) {`)
    mediaBlocks.push('\t:root {')
    mediaBlocks.push(...largeMediaLines)
    mediaBlocks.push('\t}')
    mediaBlocks.push('}')
  }

  return { primitiveLines, mediaBlocks }
}
