/**
 * Generate the CSS string for a token map and register the tokens.
 *
 * Framework-agnostic core of `setTokens`. Takes a token map (flat tokens and
 * component-prefix overrides), registers the flat tokens, and builds the full
 * `:root` + `@media` CSS string. Returns the string for the caller to do with as
 * it pleases (typically `injectTokenCSS`). Breakpoint thresholds are not part of
 * a token map — set them with `setBreakpoints` before calling this.
 *
 * Side effect: calls `registerTokens(flatTokens, prefix)`.
 *
 * The output CSS string contains a `:root` block (defaults + non-default
 * primitives) plus per-theme and per-breakpoint `@media` blocks that reassign
 * the semantic vars at runtime.
 *
 * @param tokenMap - Token map. Top-level keys may include:
 *   - Token group names (`fontSize`, `gap`, …) for flat tokens.
 *   - Known component prefixes (`button`, `icon`, …) for 3-level component
 *     overrides.
 * @param prefix - Optional component prefix for the CSS variable namespace.
 * @param options.colorSchemeEnabled - When true, emits `@media
 *   (prefers-color-scheme: dark)` switching night-theme primitives. Default
 *   `false` — night primitives are still generated, but the automatic switch
 *   is omitted.
 * @returns The full token CSS string.
 */

import { camelToKebab } from '../utilities/camelToKebab.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { getConstantKey } from './getConstant.js'
import {
  parseBreakpointKey,
  breakpointKeyQuery,
  compareBreakpointSpecificity,
  type ParsedBreakpointKey,
} from './breakpointKey.js'
import { registerTokens } from '../registry/index.js'
import componentTokensData from '../generated/componentTokensData.js'
import {
  DEFAULT_THEME,
} from '../constants/styleValues.js'
import type { TokenMap } from '../types/tokenMap.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

/** A breakpoint declaration tagged with its parsed key, for specificity sorting. */
interface BreakpointEntry {
  parsed: ParsedBreakpointKey
  declaration: string
}

type VariantValue = string | number | ThemeValue | BreakpointValue
type VariantMap = Record<string, VariantValue>
type TokenMapWithThemes = Record<string, Record<string, string | number | ThemeValue>>

/** Known component prefixes — used to detect 3-level token overrides. */
const componentPrefixes = new Set(Object.keys(componentTokensData))

/**
 * Process variant entries into CSS declarations.
 *
 * Handles three value shapes:
 * - Simple value: `"16px"` → single :root declaration
 * - ThemeValue: `{ day: "#000", night: "#fff" }` → default + theme primitives + theme media entries
 * - BreakpointValue (inline shorthand): `{ "laptop+": "20px", tablet: "16px" }`
 *   → keys whose query is "all viewports" (`phone+` / `desktop-`) land in `:root`
 *   as the base; every other key is grouped under its resolved `@media` query.
 *   Bare names are exact bands; `+` = up (min-width), `-` = down (max-width).
 *   The base is optional — omit it to override an existing token upward only.
 *
 * BreakpointValue is checked before ThemeValue — they are mutually exclusive on the same variant.
 */
function processVariants(
  cssName: string,
  variants: VariantMap,
  pkg: string | undefined,
  defaultDeclarations: string[],
  themeDeclarations: Map<string, string[]>,
  breakpointGroups: Map<string, BreakpointEntry[]>
): void {
  for (const [variant, value] of Object.entries(variants)) {
    if (isStyleValue('breakpoint', value)) {
      const cssKey = getConstantKey(cssName, variant, { pkg })

      for (const [key, bpValue] of Object.entries(value)) {
        const declaration = `${cssKey}: ${bpValue};`
        const query = breakpointKeyQuery(key)
        if (query === null) {
          // `phone+` / `desktop-` span every viewport → unconditional base.
          defaultDeclarations.push(declaration)
        } else {
          const entry: BreakpointEntry = { parsed: parseBreakpointKey(key), declaration }
          const group = breakpointGroups.get(query)
          if (group) group.push(entry)
          else breakpointGroups.set(query, [entry])
        }
      }
    } else if (isStyleValue('theme', value)) {
      const defaultValue = value[DEFAULT_THEME]
      const cssKey = getConstantKey(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssKey}: ${defaultValue};`)

      for (const [theme, themeValue] of Object.entries(value)) {
        if (theme !== DEFAULT_THEME) {
          const themeCssKey = getConstantKey(cssName, variant, { theme, pkg })
          defaultDeclarations.push(`${themeCssKey}: ${themeValue};`)

          const declarations = themeDeclarations.get(theme)
          if (declarations) {
            declarations.push(`${cssKey}: var(${themeCssKey});`)
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Neither a breakpoint map nor a theme value (e.g. a theme map missing the
      // default theme key) — would otherwise emit "[object Object]".
      throw new Error(
        `generateTokenCSS: "${cssName}.${variant}" must be a string, number, breakpoint map, or theme value with a "${DEFAULT_THEME}" key (got ${JSON.stringify(value)})`
      )
    } else {
      const cssKey = getConstantKey(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssKey}: ${value};`)
    }
  }
}

/**
 * Scan a variant map for theme dimension keys, so the per-theme declaration
 * map can be pre-initialized before processing. Breakpoint groups are keyed by
 * resolved `@media` query and built lazily during processing, so they need no
 * pre-seed here.
 */
function collectThemes(variants: VariantMap, themes: Set<string>): void {
  for (const value of Object.values(variants)) {
    // Only theme values seed here; the classifier excludes breakpoint maps.
    if (isStyleValue('theme', value)) {
      for (const theme of Object.keys(value)) {
        themes.add(theme)
      }
    }
  }
}

export function generateTokenCSS<T extends TokenMap | TokenMapWithThemes>(
  tokenMap: T,
  prefix?: string,
  options?: { colorSchemeEnabled?: boolean }
): string {
  // Separate flat tokens from component token overrides.
  const flatTokens: Record<string, VariantMap> = {}
  const componentOverrides: Record<string, Record<string, VariantMap>> = {}

  for (const [key, value] of Object.entries(tokenMap)) {
    if (key === 'breakpoints') {
      // Breakpoint thresholds are not set through a token map. Ignored (not
      // registered as a token) so stale maps don't emit junk variables.
      console.warn('generateTokenCSS: the `breakpoints` key is not supported — call setBreakpoints() instead. Ignoring it.')
    } else if (componentPrefixes.has(key)) {
      componentOverrides[key] = value as Record<string, VariantMap>
    } else {
      flatTokens[key] = value as VariantMap
    }
  }

  // Register into the runtime layer — flat tokens under `prefix`, component
  // overrides under their component prefix — so getToken reflects every override.
  registerTokens(flatTokens, prefix)
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    registerTokens(tokenGroups, componentPrefix)
  }

  // Collect themes from flat tokens and component overrides (breakpoint groups
  // are keyed by query and built lazily during processing).
  const themes = new Set<string>([DEFAULT_THEME])

  for (const variants of Object.values(flatTokens)) {
    collectThemes(variants, themes)
  }
  for (const tokenGroups of Object.values(componentOverrides)) {
    for (const variants of Object.values(tokenGroups)) {
      collectThemes(variants, themes)
    }
  }

  // Initialize declaration accumulators.
  const defaultDeclarations: string[] = []
  const themeDeclarations: Map<string, string[]> = new Map()
  for (const theme of themes) {
    if (theme !== DEFAULT_THEME) themeDeclarations.set(theme, [])
  }
  // Breakpoint declarations grouped by resolved @media query string, so keys
  // sharing a query (e.g. `desktop` and `desktop+`) merge into one block.
  const breakpointGroups: Map<string, BreakpointEntry[]> = new Map()

  // Flat tokens — 2-level: tokenName -> variant.
  for (const [tokenKey, variants] of Object.entries(flatTokens)) {
    processVariants(camelToKebab(tokenKey), variants, prefix, defaultDeclarations, themeDeclarations, breakpointGroups)
  }

  // Component token overrides — 3-level: prefix -> tokenName -> variant.
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    for (const [tokenName, variants] of Object.entries(tokenGroups)) {
      processVariants(camelToKebab(tokenName), variants, componentPrefix, defaultDeclarations, themeDeclarations, breakpointGroups)
    }
  }

  // :root block with all default + primitive declarations.
  let cssString = `
    :root {
      ${defaultDeclarations.join('\n      ')}
    }
  `

  // Color scheme media query — opt-in via colorSchemeEnabled option.
  if (options?.colorSchemeEnabled) {
    const nightDeclarations = themeDeclarations.get('night')
    if (nightDeclarations && nightDeclarations.length > 0) {
      cssString += `
    @media (prefers-color-scheme: dark) {
      :root {
        ${nightDeclarations.join('\n        ')}
      }
    }
    `
    }
  }

  // Breakpoint @media blocks — always active (not opt-in). Emit one block per
  // resolved query, ordered LEAST → MOST specific so the most specific block is
  // last and wins by source order (same `:root` specificity everywhere). Within
  // a block, declarations are likewise ordered least → most specific.
  const mostSpecific = (entries: BreakpointEntry[]): ParsedBreakpointKey =>
    entries.reduce(
      (best, entry) => (compareBreakpointSpecificity(entry.parsed, best) > 0 ? entry.parsed : best),
      entries[0].parsed
    )

  const sortedGroups = [...breakpointGroups.entries()].sort(([, a], [, b]) =>
    compareBreakpointSpecificity(mostSpecific(a), mostSpecific(b))
  )

  for (const [query, entries] of sortedGroups) {
    if (entries.length === 0) continue
    const ordered = [...entries].sort((a, b) => compareBreakpointSpecificity(a.parsed, b.parsed))
    cssString += `
    ${query} {
      :root {
        ${ordered.map((entry) => entry.declaration).join('\n        ')}
      }
    }
    `
  }

  return cssString
}