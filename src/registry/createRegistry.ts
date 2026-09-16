import { getConstantKey } from '../services/getConstant.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

/** A token's value in one layer: plain, per-theme, or per-breakpoint. */
export type TokenValue = string | number | ThemeValue | BreakpointValue

/** Which layer a value is written to: generated default or runtime override. */
export type TokenLayer = 'seed' | 'runtime'

/** What names one token: the parts its CSS variable name is built from. */
export interface TokenIdentity {
  /** Component prefix (e.g. "button"); undefined for core and custom tokens. */
  prefix?: string
  /** Group path — `["gap"]` for core tokens, `["icon", "size"]` for nested component groups. */
  path: string[]
  /** Variant within the group (e.g. "base", "large"). */
  variant: string
  /** Whether this is the inverse-color dimension (`--inverse` segment). */
  inverse?: boolean
}

/**
 * One token variant, keyed in the registry by its semantic CSS variable name
 * (e.g. `--np--gap`, `--np--button--icon--size`, `--np--color--inverse`), so
 * every way of naming the same variable reaches the same entry.
 *
 * Two layers mirror the CSS cascade: `seed` is the generated default (the
 * `tokens.css` value), `runtime` is a `setTokens` override (the injected
 * stylesheet, later in source order). Readers try `runtime`, then `seed`.
 */
export interface TokenEntry extends Required<Omit<TokenIdentity, 'prefix'>> {
  /** Semantic CSS variable name — the registry key. */
  key: string
  /** Component prefix (e.g. "button"); undefined for core and custom tokens. */
  prefix?: string
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

/**
 * Write one value into one layer — the only registry writer, used by seeding
 * and `registerTokens` alike, so every entry carries the same metadata however
 * it was created. The other layer of an existing entry is kept.
 *
 * @param layer - `seed` (generated data) or `runtime` (overrides)
 * @param identity - Prefix, group path, variant, and inverse flag of the token
 * @param value - Plain, theme, or breakpoint value
 */
export function writeToken(layer: TokenLayer, { prefix, path, variant, inverse = false }: TokenIdentity, value: TokenValue): void {
  // Core paths are single-segment, so joining is unambiguous: a leading segment
  // is only read as a namespace when a prefix put it there
  const address = prefix ? `${prefix}.${path.join('.')}` : path.join('.')
  const key = getConstantKey(address, variant, { inverse })
  const existing = registry.get(key)
  if (existing) {
    existing[layer] = value
  } else {
    registry.set(key, { key, prefix, path, variant, inverse, [layer]: value })
  }
}
