/**
 * Generate the CSS string for a token map and register the tokens.
 *
 * Framework-agnostic core of `setTokens`. Takes a token map (flat tokens and
 * component-prefix overrides), registers every token into the registry's
 * runtime layer, and builds CSS with the same shape as the generated
 * `dist/tokens.css` (shared block builders in `utilities/tokenCss`):
 *
 * - `:root` — semantic vars plus stable primitives (`--day`, `--night`, extra themes).
 * - Breakpoint `@media` blocks for breakpoint values.
 * - `@media (prefers-color-scheme: dark)` plus `[data-theme="day"|"night"]` pins,
 *   and a `[data-theme="{name}"]` pin per extra theme — so runtime themed tokens
 *   follow the OS preference, `<Theme>`, and `applyTheme` like generated ones.
 *
 * Breakpoint thresholds are set with the reserved `breakpoints` key
 * (`{ tablet?, laptop?, desktop? }` in pixels). They apply before any CSS in the
 * same call is built, update every `BREAKPOINTS` reader, re-emit the generated
 * breakpoint cascade, and — when a threshold changes — regenerate and re-inject
 * the CSS of every earlier call (last token map per prefix) so previously
 * injected `+` / `-` breakpoint blocks move to the new thresholds.
 *
 * @param tokenMap - Token map. Top-level keys may include:
 *   - `breakpoints` — breakpoint thresholds (see above).
 *   - Token group names (`fontSize`, `gap`, …) for flat tokens.
 *   - Known component prefixes (`button`, `icon`, …) for component overrides.
 * @param prefix - Optional component prefix for the CSS variable namespace.
 * @returns The full token CSS string for this call.
 */

import { camelToKebab } from '../utilities/camelToKebab.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { mediaBlock, pinBlock, themeBlocks } from '../utilities/tokenCss.js'
import { getConstantKey } from './getConstant.js'
import {
  parseBreakpointKey,
  breakpointKeyQuery,
  compareBreakpointSpecificity,
  type ParsedBreakpointKey,
} from './breakpointKey.js'
import { registerTokens } from '../registry/index.js'
import { applyBreakpoints } from '../utilities/applyBreakpoints.js'
import { injectTokenCSS } from '../utilities/tokenStyleSheet.js'
import componentTokensData from '../generated/componentTokensData.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'
import type { BreakpointValues } from '../constants/breakpoints.js'
import type { TokenMap } from '../types/tokenMap.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

/** The theme mapped to `prefers-color-scheme: dark` and paired with the day pin. */
const NIGHT_THEME = 'night'

/** A breakpoint declaration tagged with its parsed key, for specificity sorting. */
interface BreakpointEntry {
  parsed: ParsedBreakpointKey
  declaration: string
}

/** Line accumulators shared across every processed variant. */
interface CssAccumulators {
  rootLines: string[]
  nightBody: string[]
  dayBody: string[]
  extraThemeBodies: Map<string, string[]>
  breakpointGroups: Map<string, BreakpointEntry[]>
}

type VariantValue = string | number | ThemeValue | BreakpointValue
type VariantMap = Record<string, VariantValue>
type TokenMapWithThemes = Record<string, Record<string, string | number | ThemeValue>>

/** Known component prefixes — used to detect component token overrides. */
const componentPrefixes = new Set(Object.keys(componentTokensData))

/**
 * Last token map (without `breakpoints`) per injection prefix — the same key
 * `injectTokenCSS` dedupes on — so a threshold change can regenerate every
 * injected stylesheet.
 */
const tokenMapsByPrefix = new Map<string, Record<string, unknown>>()

/** Emit a theme value: semantic + primitives in `:root`, reassignments into the theme bodies. */
function processThemeValue(cssName: string, variant: string, value: ThemeValue, pkg: string | undefined, acc: CssAccumulators): void {
  const cssKey = getConstantKey(cssName, variant, { pkg })
  const defaultValue = value[DEFAULT_THEME]
  acc.rootLines.push(`\t${cssKey}: ${defaultValue};`)

  const otherThemes = Object.entries(value).filter(([theme]) => theme !== DEFAULT_THEME)
  if (otherThemes.length === 0) return

  const dayKey = getConstantKey(cssName, variant, { pkg, theme: DEFAULT_THEME })
  acc.rootLines.push(`\t${dayKey}: ${defaultValue};`)

  for (const [theme, themeValue] of otherThemes) {
    const themeKey = getConstantKey(cssName, variant, { pkg, theme })
    acc.rootLines.push(`\t${themeKey}: ${themeValue};`)
    if (theme === NIGHT_THEME) {
      acc.nightBody.push(`\t\t${cssKey}: var(${themeKey});`)
      acc.dayBody.push(`\t\t${cssKey}: var(${dayKey});`)
    } else {
      const body = acc.extraThemeBodies.get(theme) ?? []
      body.push(`\t${cssKey}: var(${themeKey});`)
      acc.extraThemeBodies.set(theme, body)
    }
  }
}

/**
 * Process variant entries into CSS lines.
 *
 * - Simple value: `"16px"` → `:root` declaration.
 * - Theme value: `{ day, night, … }` → see `processThemeValue`.
 * - Breakpoint map: `{ "laptop+": "20px", tablet: "16px" }` → keys spanning every
 *   viewport (`phone+` / `desktop-`) land in `:root`; every other key is grouped
 *   under its resolved `@media` query. Bare names are exact bands; `+` = up,
 *   `-` = down.
 */
function processVariants(cssName: string, variants: VariantMap, pkg: string | undefined, acc: CssAccumulators): void {
  for (const [variant, value] of Object.entries(variants)) {
    if (isStyleValue('breakpoint', value)) {
      const cssKey = getConstantKey(cssName, variant, { pkg })
      for (const [key, bpValue] of Object.entries(value)) {
        const declaration = `${cssKey}: ${bpValue};`
        const query = breakpointKeyQuery(key)
        if (query === null) {
          acc.rootLines.push(`\t${declaration}`)
        } else {
          const entries = acc.breakpointGroups.get(query) ?? []
          entries.push({ parsed: parseBreakpointKey(key), declaration })
          acc.breakpointGroups.set(query, entries)
        }
      }
    } else if (isStyleValue('theme', value)) {
      processThemeValue(cssName, variant, value, pkg, acc)
    } else if (typeof value === 'object' && value !== null) {
      // Neither a breakpoint map nor a theme value (e.g. a theme map missing the
      // default theme key) — would otherwise emit "[object Object]".
      throw new Error(
        `generateTokenCSS: "${cssName}.${variant}" must be a string, number, breakpoint map, or theme value with a "${DEFAULT_THEME}" key (got ${JSON.stringify(value)})`
      )
    } else {
      acc.rootLines.push(`\t${getConstantKey(cssName, variant, { pkg })}: ${value};`)
    }
  }
}

/** Breakpoint `@media` blocks, least → most specific so the most specific wins by source order. */
function breakpointBlocks(breakpointGroups: Map<string, BreakpointEntry[]>): string[] {
  const mostSpecific = (entries: BreakpointEntry[]): ParsedBreakpointKey =>
    entries.reduce(
      (best, entry) => (compareBreakpointSpecificity(entry.parsed, best) > 0 ? entry.parsed : best),
      entries[0].parsed
    )

  return [...breakpointGroups.entries()]
    .sort(([, a], [, b]) => compareBreakpointSpecificity(mostSpecific(a), mostSpecific(b)))
    .flatMap(([query, entries]) =>
      mediaBlock(
        query,
        [...entries]
          .sort((a, b) => compareBreakpointSpecificity(a.parsed, b.parsed))
          .map((entry) => `\t\t${entry.declaration}`)
      )
    )
}

export function generateTokenCSS<T extends TokenMap | TokenMapWithThemes>(tokenMap: T, prefix?: string): string {
  const { breakpoints, ...tokens } = tokenMap as Record<string, unknown>
  const prefixKey = prefix ?? ''

  // Thresholds first, so this call's breakpoint blocks use them.
  const thresholdsChanged = breakpoints !== undefined && applyBreakpoints(breakpoints as Partial<BreakpointValues>)

  tokenMapsByPrefix.set(prefixKey, tokens)

  // Earlier calls' injected CSS was built against the old thresholds — rebuild it.
  if (thresholdsChanged) {
    for (const [storedPrefix, storedTokens] of tokenMapsByPrefix) {
      if (storedPrefix === prefixKey) continue
      injectTokenCSS(storedPrefix, buildTokenCss(storedTokens, storedPrefix || undefined))
    }
  }

  return buildTokenCss(tokens, prefix)
}

/** Register a token map (without `breakpoints`) and build its CSS. */
function buildTokenCss(tokens: Record<string, unknown>, prefix?: string): string {
  // Separate flat tokens from component token overrides.
  const flatTokens: Record<string, VariantMap> = {}
  const componentOverrides: Record<string, Record<string, VariantMap>> = {}

  for (const [key, value] of Object.entries(tokens)) {
    if (componentPrefixes.has(key)) {
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

  const acc: CssAccumulators = {
    rootLines: [],
    nightBody: [],
    dayBody: [],
    extraThemeBodies: new Map(),
    breakpointGroups: new Map(),
  }

  for (const [tokenKey, variants] of Object.entries(flatTokens)) {
    processVariants(camelToKebab(tokenKey), variants, prefix, acc)
  }
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    for (const [tokenName, variants] of Object.entries(tokenGroups)) {
      processVariants(camelToKebab(tokenName), variants, componentPrefix, acc)
    }
  }

  // Same section order as dist/tokens.css: :root, breakpoint media, theme media + pins, extra theme pins.
  return [
    ':root {',
    ...acc.rootLines,
    '}',
    ...breakpointBlocks(acc.breakpointGroups),
    ...themeBlocks(acc.nightBody, acc.dayBody),
    ...[...acc.extraThemeBodies].flatMap(([theme, body]) => pinBlock(theme, body)),
  ].join('\n')
}
