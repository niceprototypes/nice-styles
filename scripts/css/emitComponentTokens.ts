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
 * Build the full CSS variable name from a component prefix and a nesting path.
 * Each path segment is kebab-cased independently before joining with `--`.
 */
export function buildCssKey(prefix: string, pathSegments: string[]): string {
  const cssSegments = pathSegments.map(s => camelToKebab(s))
  return `--${NAMESPACE}--${prefix}--${cssSegments.join('--')}`
}

/**
 * Build the semantic CSS variable line for a component token.
 */
function buildSemanticLine(cssKey: string, value: string): string {
  return `\t${cssKey}: ${value};`
}

/**
 * Build the day-mode primitive line — pinned to the day value, never reassigned.
 */
function buildDayPrimitiveLine(cssKey: string, value: string): string {
  return `\t${cssKey}--day: ${value};`
}

/**
 * Build the night-mode primitive line — pinned to the night value, never reassigned.
 */
function buildNightPrimitiveLine(cssKey: string, value: string): string {
  return `\t${cssKey}--night: ${value};`
}

/**
 * Build the @media body line that reassigns the semantic var to the night primitive.
 */
function buildNightMediaLine(cssKey: string): string {
  return `\t\t${cssKey}: var(${cssKey}--night);`
}

/**
 * Resolve the parallel night branch at a given key, falling back to {} when day
 * has a branch but night has no overrides for it. Strings can't be branches.
 */
function getNightBranch(
  nightNode: { [key: string]: TokenNode },
  key: string
): { [key: string]: TokenNode } {
  const sub = nightNode[key]
  if (sub && typeof sub === 'object') {
    return sub as { [key: string]: TokenNode }
  }
  return {}
}

/**
 * Generates CSS lines for component tokens, including night-mode primitives
 * for any component tokens that have night overrides.
 *
 * Walks the token tree recursively. Each nesting level becomes a -- segment:
 *   --np--button--size--base: var(--np--cell-height--base);
 *   --np--button--status--primary--base--background-color: var(--np--color--base);
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
   * Handle a leaf in the token tree. Emits the semantic line and, when a night
   * override exists at the same path, the matching primitives + media entry.
   */
  function emitLeaf(
    prefix: string,
    pathSegments: string[],
    value: string,
    nightValue: TokenNode | undefined
  ): void {
    const cssKey = buildCssKey(prefix, pathSegments)
    semanticLines.push(buildSemanticLine(cssKey, value))

    if (typeof nightValue !== 'string') return
    dayPrimitives.push(buildDayPrimitiveLine(cssKey, value))
    nightPrimitives.push(buildNightPrimitiveLine(cssKey, nightValue))
    nightMediaBody.push(buildNightMediaLine(cssKey))
  }

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
      const newPath = [...pathSegments, key]

      if (typeof value === 'string') {
        emitLeaf(prefix, newPath, value, nightNode[key])
        continue
      }

      if (typeof value === 'object' && value !== null) {
        // Branch: recurse deeper, carrying the parallel night node
        walk(prefix, value as { [key: string]: TokenNode }, getNightBranch(nightNode, key), newPath)
      }
    }
  }

  /**
   * Push a blank line + comment header before each prefix's semantic lines,
   * so the output is visually grouped per component in the generated CSS.
   */
  function pushPrefixHeader(prefix: string): void {
    semanticLines.push('')
    semanticLines.push(`\t/* ${prefix} component tokens */`)
  }

  // Process each component prefix independently, seeding walk with an empty path
  for (const [prefix, tokenMap] of Object.entries(componentTokens)) {
    // Fall back to empty object if this prefix has no night overrides
    const nightTokenMap = componentNightTokens[prefix] || {}

    pushPrefixHeader(prefix)
    walk(
      prefix,
      tokenMap as { [key: string]: TokenNode },
      nightTokenMap as { [key: string]: TokenNode },
      []
    )
  }

  return { semanticLines, dayPrimitives, nightPrimitives, nightMediaBody }
}
