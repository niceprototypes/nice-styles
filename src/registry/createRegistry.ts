import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

/** A token's value in one layer: plain, per-theme, or per-breakpoint. */
export type TokenValue = string | number | ThemeValue | BreakpointValue

/**
 * One token variant, keyed in the registry by its semantic CSS variable name
 * (e.g. `--np--gap`, `--np--button--icon--size`, `--np--color--inverse`), so
 * every way of naming the same variable reaches the same entry.
 *
 * Two layers mirror the CSS cascade: `seed` is the generated default (the
 * `tokens.css` value), `runtime` is a `setTokens` override (the injected
 * stylesheet, later in source order). Readers try `runtime`, then `seed`.
 */
export interface TokenEntry {
  /** Semantic CSS variable name — the registry key. */
  key: string
  /** Component prefix (e.g. "button"); undefined for core and custom tokens. */
  prefix?: string
  /** Group path — `["gap"]` for core tokens, `["icon", "size"]` for nested component groups. */
  path: string[]
  /** Variant within the group (e.g. "base", "large"). */
  variant: string
  /** Whether this is the inverse-color dimension (`--inverse` segment). */
  inverse: boolean
  /** Generated default value. */
  seed?: TokenValue
  /** Runtime override registered by `setTokens` / `registerTokens`. */
  runtime?: TokenValue
}

/**
 * The token store — every token (core, custom, theme, breakpoint, inverse,
 * component) in one map. Seeded at module evaluation from `./index.ts`; the
 * runtime layer is written by `registerTokens`.
 */
export const registry = new Map<string, TokenEntry>()
