/**
 * List registered tokens — the enumeration counterpart of `getToken`.
 *
 * One pass over the registry: every token (core, custom, theme, breakpoint,
 * inverse, component) with its identity, the themes and breakpoints it has
 * values for, and which layers hold it. Read `var()` / values with `getToken`
 * using a listing's `path`, `variant`, `prefix`, and `inverse`.
 *
 * @example listTokens({ prefix: "button" })          // every button component token
 * @example listTokens({ group: "color" })            // color variants, base and inverse
 * @example listTokens({ source: "runtime" })         // tokens only setTokens created
 * @example
 * listTokens({ group: "gap", variant: "base" })
 * // [{ key: "--np--gap", prefix: undefined, path: ["gap"], variant: "base", inverse: false,
 * //    themes: [], breakpoints: [], source: "seed" }]
 */

import { isStyleValue } from '../utilities/isStyleValue.js'
import { registry, type TokenEntry, type TokenValue } from '../registry/index.js'

/** Which layers hold a token: generated only, `setTokens` only, or both. */
export type TokenSource = 'seed' | 'runtime' | 'both'

/** One registered token, as returned by `listTokens`. */
export interface TokenListing {
  /** Semantic CSS variable name (e.g. `--np--button--icon--size`) */
  key: string
  /** Component prefix; undefined for core and custom tokens */
  prefix?: string
  /** Group path — `["gap"]`, or `["icon", "size"]` for nested component groups */
  path: string[]
  /** Variant within the group */
  variant: string
  /** Inverse-color dimension */
  inverse: boolean
  /** Theme names with a value in any layer (`[]` for an unthemed token) */
  themes: string[]
  /** Breakpoint keys with a value in any layer, including ranges set at runtime (`laptop+`) */
  breakpoints: string[]
  /** Which layers hold the token */
  source: TokenSource
}

/** Filter for `listTokens`; every field is optional and all given fields must match. */
export interface ListTokensFilter {
  /** Component prefix (e.g. "button"), matched exactly */
  prefix?: string
  /** First path segment — the group (e.g. "color", or "icon" for `["icon", "size"]`) */
  group?: string
  /** Variant name (e.g. "base") */
  variant?: string
  /** Layer set, matched exactly (`"seed"` excludes tokens that also have a runtime value) */
  source?: TokenSource
}

/**
 * Keys of every theme or breakpoint layer, seed first, without duplicates.
 *
 * @param layers - `[seed, runtime]`; undefined layers and plain values contribute nothing
 * @param kind - Which style-value kind to collect keys from
 * @returns Theme names or breakpoint keys, in first-seen order
 */
function dimensionKeys(layers: (TokenValue | undefined)[], kind: 'theme' | 'breakpoint'): string[] {
  const keys = layers.flatMap((layer) => (isStyleValue(kind, layer) ? Object.keys(layer) : []))
  return [...new Set(keys)]
}

/**
 * Build the listing for one entry.
 *
 * @param entry - Registry entry
 * @returns The entry's identity plus its dimensions and source
 */
function toListing(entry: TokenEntry): TokenListing {
  // Seed first, so generated dimension keys keep their generated order
  const layers = [entry.seed, entry.runtime]
  // An entry always has at least one layer: writeToken creates it with the layer it writes
  const source: TokenSource =
    entry.seed !== undefined && entry.runtime !== undefined ? 'both' : entry.runtime !== undefined ? 'runtime' : 'seed'
  return {
    key: entry.key,
    prefix: entry.prefix,
    path: entry.path,
    variant: entry.variant,
    inverse: entry.inverse,
    themes: dimensionKeys(layers, 'theme'),
    breakpoints: dimensionKeys(layers, 'breakpoint'),
    source,
  }
}

/**
 * @param filter - Optional match on prefix, group, variant, and source
 * @returns Matching tokens in registration order (generated data first, then runtime additions)
 */
export function listTokens(filter: ListTokensFilter = {}): TokenListing[] {
  const { prefix, group, variant, source } = filter
  const listings: TokenListing[] = []

  for (const entry of registry.values()) {
    // Identity filters read the entry directly; source needs the listing
    if (prefix !== undefined && entry.prefix !== prefix) continue
    if (group !== undefined && entry.path[0] !== group) continue
    if (variant !== undefined && entry.variant !== variant) continue
    const listing = toListing(entry)
    if (source !== undefined && listing.source !== source) continue
    listings.push(listing)
  }

  return listings
}
