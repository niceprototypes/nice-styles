/**
 * Component breakpoint CSS emitter.
 *
 * The breakpoint-axis parallel of emitComponentTokens (which handles the theme
 * axis). Walks the arbitrarily-nested component token tree and, for any leaf
 * with a tablet/laptop/desktop override, emits phone/{bp} primitives plus the
 * `@media (min-width)` reassignments — the same shape emitBreakpointTokens
 * produces for flat module tokens, applied over the nested component structure.
 *
 * Phone-first: the component's base value is the phone default. The semantic var
 * (emitted by emitComponentTokens) already holds it, so phone needs no media
 * query; tablet/laptop/desktop reassign the semantic var to their primitive.
 */

import { buildCssKey } from './emitComponentTokens.js'
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
} from '../../src/constants/breakpoints.js'
import type { ComponentTokens, ComponentBreakpointTokens, TokenNode } from './types.js'

export interface ComponentBreakpointResult {
  /** Breakpoint primitive lines for inside :root */
  primitiveLines: string[]
  /** Complete @media (min-width) blocks for appending after :root */
  mediaBlocks: string[]
}

/** The override breakpoints in phone-first ascending order (phone is the default). */
const OVERRIDE_BREAKPOINTS = [BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP] as const

/** Resolve the parallel breakpoint branch at a key — {} when absent or a leaf. */
function getBranch(node: { [key: string]: TokenNode }, key: string): { [key: string]: TokenNode } {
  const sub = node[key]
  return sub && typeof sub === 'object' ? (sub as { [key: string]: TokenNode }) : {}
}

/** Resolve a string leaf override at a key — undefined when absent or a branch. */
function getLeaf(node: { [key: string]: TokenNode }, key: string): string | undefined {
  const sub = node[key]
  return typeof sub === 'string' ? sub : undefined
}

/**
 * Append a wrapped @media (min-width) block. No-op when empty, so the file
 * stays compact and the output matches the module breakpoint emitter exactly.
 */
function pushMediaBlock(blocks: string[], minWidth: number, body: string[]): void {
  if (body.length === 0) return
  blocks.push('')
  blocks.push(`@media (min-width: ${minWidth}px) {`)
  blocks.push('\t:root {')
  blocks.push(...body)
  blocks.push('\t}')
  blocks.push('}')
}

/**
 * Generates component breakpoint primitives and @media blocks.
 *
 * @param componentTokens - The day/base component trees (provide phone defaults)
 * @param componentBreakpointTokens - Per-prefix `{ breakpoint: partialTree }` overrides
 */
export function generateComponentBreakpointCss(
  componentTokens: ComponentTokens,
  componentBreakpointTokens: ComponentBreakpointTokens
): ComponentBreakpointResult {
  const primitiveLines: string[] = []
  const mediaLines: Record<string, string[]> = {
    [BREAKPOINT_TABLET]: [],
    [BREAKPOINT_LAPTOP]: [],
    [BREAKPOINT_DESKTOP]: [],
  }

  /**
   * Walk the base tree, carrying each override breakpoint's parallel partial
   * tree (bpNodes). At a leaf with any override, emit the phone primitive (base
   * value) plus a primitive + media-reassignment per overriding breakpoint.
   */
  function walk(
    prefix: string,
    dayNode: { [key: string]: TokenNode },
    bpNodes: Record<string, { [key: string]: TokenNode }>,
    path: string[]
  ): void {
    for (const [key, value] of Object.entries(dayNode)) {
      const newPath = [...path, key]

      if (typeof value === 'string') {
        const overrides = OVERRIDE_BREAKPOINTS
          .map(bp => ({ bp, value: getLeaf(bpNodes[bp], key) }))
          .filter((o): o is { bp: string; value: string } => o.value !== undefined)
        if (overrides.length === 0) continue

        const cssKey = buildCssKey(prefix, newPath)
        // Phone primitive — the base/default value the semantic var holds by default
        primitiveLines.push(`\t${cssKey}--${BREAKPOINT_PHONE}: ${value};`)
        for (const { bp, value: bpValue } of overrides) {
          primitiveLines.push(`\t${cssKey}--${bp}: ${bpValue};`)
          mediaLines[bp].push(`\t\t${cssKey}: var(${cssKey}--${bp});`)
        }
        continue
      }

      if (typeof value === 'object' && value !== null) {
        // Branch: recurse, narrowing each breakpoint's parallel node in lockstep
        const childBpNodes: Record<string, { [key: string]: TokenNode }> = {}
        for (const bp of OVERRIDE_BREAKPOINTS) childBpNodes[bp] = getBranch(bpNodes[bp], key)
        walk(prefix, value as { [key: string]: TokenNode }, childBpNodes, newPath)
      }
    }
  }

  for (const [prefix, tokenMap] of Object.entries(componentTokens)) {
    const bpMap = componentBreakpointTokens[prefix]
    if (!bpMap) continue
    const bpNodes: Record<string, { [key: string]: TokenNode }> = {}
    for (const bp of OVERRIDE_BREAKPOINTS) {
      bpNodes[bp] = (bpMap[bp] as { [key: string]: TokenNode }) || {}
    }
    // Seed the path empty — buildCssKey prepends the prefix itself (the [prefix]
    // seed is only for the validator's human-readable error paths).
    walk(prefix, tokenMap as { [key: string]: TokenNode }, bpNodes, [])
  }

  // Section header only when there are primitives — mirrors the module size section.
  if (primitiveLines.length > 0) {
    primitiveLines.unshift('\t/* Component size breakpoint primitives */')
    primitiveLines.unshift('')
  }

  const mediaBlocks: string[] = []
  pushMediaBlock(mediaBlocks, BREAKPOINTS[BREAKPOINT_TABLET], mediaLines[BREAKPOINT_TABLET])
  pushMediaBlock(mediaBlocks, BREAKPOINTS[BREAKPOINT_LAPTOP], mediaLines[BREAKPOINT_LAPTOP])
  pushMediaBlock(mediaBlocks, BREAKPOINTS[BREAKPOINT_DESKTOP], mediaLines[BREAKPOINT_DESKTOP])

  return { primitiveLines, mediaBlocks }
}
