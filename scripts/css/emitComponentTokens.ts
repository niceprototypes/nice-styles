/**
 * Component token CSS emitter.
 *
 * Walks the (potentially nested) component token tree recursively.
 * Each nesting level becomes a `--` segment in the CSS variable name.
 *
 * Flat tokens (size, spacing, borderRadius) pass through at depth 1.
 * Nested tokens (status.primary.base.backgroundColor) produce deeper paths.
 */

import { NAMESPACE } from '../../src/services/getConstant.js'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import type { ComponentTokens, TokenNode, CssEmitResult } from './types.js'

/**
 * Generates CSS lines for component tokens, including night-mode primitives
 * for any component tokens that have night overrides.
 *
 * Walks the token tree recursively. Each nesting level becomes a -- segment:
 *   --np--button--size--base: var(--np--cell-height--base);
 *   --np--button--status--primary--base--background-color: var(--np--foreground-color--base);
 *
 * For tokens with night overrides, emits day/night primitives and media query entries.
 */
export function generateComponentTokenCss(
  componentTokens: ComponentTokens,
  componentNightTokens: ComponentTokens
): CssEmitResult {
  const semanticLines: string[] = []
  const dayPrimitives: string[] = []
  const nightPrimitives: string[] = []
  const nightMediaBody: string[] = []

  /**
   * Recursively walk the token tree. When a string leaf is found, emit CSS.
   * pathSegments accumulates the nesting path (each becomes a -- segment).
   * nightNode mirrors the day structure but only contains overrides.
   */
  function walk(
    prefix: string,
    dayNode: { [key: string]: TokenNode },
    nightNode: { [key: string]: TokenNode },
    pathSegments: string[]
  ): void {
    for (const [key, value] of Object.entries(dayNode)) {
      // Accumulate path — each key becomes a -- segment in the CSS variable name
      const newPath = [...pathSegments, key]

      if (typeof value === 'string') {
        // Leaf: convert each path segment independently (camelCase → kebab-case) and join with --
        const cssSegments = newPath.map(s => camelToKebab(s))
        const cssKey = `--${NAMESPACE}--${prefix}--${cssSegments.join('--')}`

        // Semantic variable — the one components reference
        semanticLines.push(`\t${cssKey}: ${value};`)

        // Check for night override at this exact leaf path
        const nightValue = nightNode[key]
        if (typeof nightValue === 'string') {
          // Day primitive — pinned to the day value, never reassigned by media query
          const dayCssKey = `${cssKey}--day`
          dayPrimitives.push(`\t${dayCssKey}: ${value};`)

          // Night primitive — pinned to the night value, never reassigned by media query
          const nightCssKey = `${cssKey}--night`
          nightPrimitives.push(`\t${nightCssKey}: ${nightValue};`)

          // Media query entry — reassigns the semantic variable to the night primitive
          nightMediaBody.push(`\t\t${cssKey}: var(${nightCssKey});`)
        }
      } else if (typeof value === 'object' && value !== null) {
        // Branch: recurse deeper, carrying the parallel night node (or empty if no night overrides at this depth)
        const nightSubNode = (nightNode[key] && typeof nightNode[key] === 'object')
          ? nightNode[key] as { [key: string]: TokenNode }
          : {}
        walk(prefix, value as { [key: string]: TokenNode }, nightSubNode, newPath)
      }
    }
  }

  // Process each component prefix independently, seeding walk with an empty path
  for (const [prefix, tokenMap] of Object.entries(componentTokens)) {
    // Fall back to empty object if this prefix has no night overrides
    const nightTokenMap = componentNightTokens[prefix] || {}

    semanticLines.push('')
    semanticLines.push(`\t/* ${prefix} component tokens */`)

    walk(
      prefix,
      tokenMap as { [key: string]: TokenNode },
      nightTokenMap as { [key: string]: TokenNode },
      []
    )
  }

  return { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody }
}
