/**
 * Shared types for the build scripts — the token source model and its parts.
 *
 * Used by every build pipeline (`generateTokens`, `generateTypes`, `generateCss`)
 * and `scripts/css/`. Emitter shapes (`FlatTokens`, `DimensionTokens`,
 * `TokenTree`) are defined once in `src/utilities/css/types.ts`, shared with the
 * runtime, and re-exported here.
 */

import type { ComponentTokenNode } from '../../src/types/tokenMap.js'
import type { DimensionTokens, FlatTokens, TokenTree } from '../../src/utilities/css/types.js'

export type { ComponentTokenNode, DimensionTokens, FlatTokens, TokenTree }

/** Flat token groups: `{ group: { variant: value } }`. */
export type Tokens = FlatTokens

/** Sparse night overrides of `Tokens`, validated against the day base. */
export type NightTokens = FlatTokens

/** One node of a component token tree: a value or a nested group. */
export type TokenNode = ComponentTokenNode

/** Component token trees keyed by prefix. */
export type ComponentTokens = Record<string, TokenTree>

/** Flat token groups keyed by breakpoint: `{ breakpoint: { group: { variant: value } } }`. */
export type BreakpointTokens = DimensionTokens

/** Component `$breakpoints` partial trees keyed by prefix, then breakpoint. */
export type ComponentBreakpointTokens = Record<string, Record<string, TokenTree>>

/** Validation message templates from `src/errors.json`, with `{placeholder}` syntax. */
export type Errors = Record<string, string>

/**
 * Every token source, read and validated once by `readTokenSources`.
 * Mirrors the source layout: module groups and their `$themes` / `$breakpoints` /
 * `$inverse` axes, component trees and their `$themes` / `$breakpoints` axes,
 * and the breakpoint thresholds.
 */
export interface TokenSourceModel {
  /** Unthemed base groups (no group in any `$themes`) */
  core: Tokens
  themes: {
    /** Base values of themed groups */
    day: Tokens
    /** `$themes.night` overrides — the OS dark default */
    night: NightTokens
    /** Every other `$themes` entry, keyed by theme name */
    extras: Record<string, Tokens>
  }
  /** `$breakpoints` values keyed by breakpoint (`phone` holds the semantic defaults) */
  breakpointTokens: BreakpointTokens
  /** `$inverse` values, keyed by base group name */
  inverse: {
    /** Inverse base values */
    day: Tokens
    /** Inverse `$themes.night` values; `{}` for a group without them */
    night: NightTokens
  }
  components: {
    /** Base trees keyed by prefix, `$` axes removed */
    base: ComponentTokens
    themes: {
      /** `$themes.night` partial trees keyed by prefix */
      night: ComponentTokens
      /** Every other `$themes` partial tree, keyed by prefix, then theme */
      extras: Record<string, Record<string, TokenTree>>
    }
    /** `$breakpoints` partial trees keyed by prefix, then breakpoint */
    breakpoints: ComponentBreakpointTokens
  }
  /** Pixel floors from `src/tokens/breakpoints.json` */
  thresholds: Record<string, number>
}
