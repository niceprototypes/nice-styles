/**
 * Shared shapes for token CSS emission.
 *
 * Used by every emitter in `src/utilities/css/` — at build time through
 * `scripts/css/assembleCombined.ts` (→ `dist/tokens.css`) and at runtime through
 * `generateTokenCSS` / `applyBreakpoints`.
 */

import type { ComponentTokenNode } from '../../types/tokenMap.js'

/**
 * A component token tree: nested groups whose string leaves are values.
 * Keys starting with `$` (`$themes`, `$breakpoints`) are reserved override axes,
 * not token groups.
 */
export type TokenTree = { [key: string]: ComponentTokenNode }

/** Flat token groups: `{ group: { variant: value } }`. */
export type FlatTokens = Record<string, Record<string, string>>

/** Flat token groups keyed by one dimension (a theme or a breakpoint): `{ dimension: FlatTokens }`. */
export type DimensionTokens = Record<string, FlatTokens>

/**
 * Line output of a day/night emitter. The assembler places each array in its
 * own section of the output file.
 */
export interface CssEmitResult {
  /** Semantic variable declarations (`:root`), later reassigned by theme blocks */
  semanticLines: string[]
  /** `--day` primitive declarations (`:root`), never reassigned */
  dayPrimitives: string[]
  /** `--night` primitive declarations (`:root`), never reassigned */
  nightPrimitives: string[]
  /** Reassignments to `--night` primitives — body of the prefers-color-scheme block and the night pin */
  nightMediaBody: string[]
  /** The matching reassignments to `--day` primitives — body of the day pin */
  dayPinBody: string[]
}
