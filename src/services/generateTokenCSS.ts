/**
 * Generate the CSS string for a token map and register the tokens.
 *
 * Framework-agnostic core of `setTokens`. Takes a token map (flat tokens and
 * component-prefix overrides), registers every token into the registry's
 * runtime layer, and builds CSS with the same shape as the generated
 * `dist/tokens.css` (shared builders in `utilities/css/`):
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
 * This function returns the CSS for the current call without injecting it;
 * the caller (`setTokens` in nice-react-styles) passes it to `injectTokenCSS`.
 * Only the regenerated CSS of earlier calls is injected here.
 *
 * @example
 * generateTokenCSS({ brandColor: { primary: { day: "#000", night: "#fff" } } })
 * // :root { --np--brand-color--primary: #000; --np--brand-color--primary--day: #000; --np--brand-color--primary--night: #fff; }
 * // @media (prefers-color-scheme: dark) { :root { --np--brand-color--primary: var(--np--brand-color--primary--night); } }
 * // [data-theme="day"] { … }  [data-theme="night"] { … }
 *
 * @param tokenMap - Token map. Top-level keys may include:
 *   - `breakpoints` — breakpoint thresholds (see above).
 *   - Token group names (`fontSize`, `gap`, …) for flat tokens.
 *   - Known component prefixes (`button`, `icon`, …) for component overrides.
 * @param prefix - Optional component prefix for the CSS variable namespace.
 * @returns The full token CSS string for this call.
 * @throws when a variant value is an object that is neither a breakpoint map nor
 *   a theme value, or when the `breakpoints` key is invalid (see `applyBreakpoints`).
 */

import { camelToKebab } from '../utilities/camelToKebab.js'
import { isStyleValue } from '../utilities/isStyleValue.js'
import { mediaBlock, themeBlocks, themePinBlock } from '../utilities/css/blocks.js'
import { declarationLine, reassignmentLine } from '../utilities/css/declarations.js'
import { getConstantKey } from './getConstant.js'
import {
  parseBreakpointKey,
  breakpointKeyQuery,
  compareBreakpointSpecificity,
  type ParsedBreakpointKey,
} from './breakpointKey.js'
import { registerTokens } from '../registry/index.js'
import { applyBreakpoints } from '../utilities/applyBreakpoints.js'
import { completeThemeValue } from '../utilities/completeThemeValue.js'
import { injectTokenCSS } from '../utilities/tokenStyleSheet.js'
import componentTokensData, { type ComponentTokenNode } from '../generated/componentTokensData.js'
import { DEFAULT_THEME, NIGHT_THEME } from '../constants/styleValues.js'
import type { BreakpointValues } from '../constants/breakpoints.js'
import type { RuntimeTokenMap, RuntimeTokenValue, TokenMap } from '../types/tokenMap.js'
import type { ThemeValue } from '../types/styleValues.js'

/** A breakpoint declaration tagged with its parsed key, for specificity sorting. */
interface BreakpointEntry {
  /** The key the declaration came from (`laptop+`, `tablet`, …), parsed for sorting */
  parsed: ParsedBreakpointKey
  /** Depth-2 declaration line for inside `@media { :root { } }` */
  declaration: string
}

/** Line accumulators shared across every processed variant. */
interface CssAccumulators {
  /** Declarations for the `:root` block: plain values, theme defaults and primitives, all-viewport breakpoint values */
  rootLines: string[]
  /** Reassignments to `--night` primitives — body of the prefers-color-scheme block and the night pin */
  nightBody: string[]
  /** Matching reassignments to `--day` primitives — body of the day pin */
  dayBody: string[]
  /** Per extra theme name, the reassignments for its `[data-theme="{name}"]` pin */
  extraThemeBodies: Map<string, string[]>
  /** Per resolved `@media` query string, the declarations that belong inside it */
  breakpointGroups: Map<string, BreakpointEntry[]>
}

/** One group's variants: `{ variant: value }`. */
type VariantMap = Record<string, RuntimeTokenValue>

/** Known component prefixes — used to detect component token overrides. */
const componentPrefixes = new Set(Object.keys(componentTokensData))

/**
 * Last token map (without `breakpoints`) per injection prefix — the same key
 * `injectTokenCSS` dedupes on — so a threshold change can regenerate every
 * injected stylesheet.
 */
const tokenMapsByPrefix = new Map<string, Record<string, unknown>>()

/**
 * Emit a theme value: semantic + primitives in `:root`, reassignments into the theme bodies.
 *
 * The semantic variable holds the default (`day`) value. Primitives and
 * reassignments are only emitted when at least one other theme is present;
 * a `{ day }`-only value is a plain declaration.
 *
 * @param cssName - Kebab-case group name
 * @param variant - Variant name
 * @param value - Theme value with a `day` key
 * @param pkg - Prefix for the variable namespace, or undefined for core
 * @param acc - Accumulators the lines are pushed into
 */
function processThemeValue(cssName: string, variant: string, value: ThemeValue, pkg: string | undefined, acc: CssAccumulators): void {
  // The namespace lives in the address; options carry no identity
  const address = pkg ? `${pkg}.${cssName}` : cssName
  // Semantic variable at its default-theme value
  const cssKey = getConstantKey(address, variant)
  const defaultValue = value[DEFAULT_THEME]
  acc.rootLines.push(declarationLine(cssKey, defaultValue))

  // Nothing to switch between without a second theme
  const otherThemes = Object.entries(value).filter(([theme]) => theme !== DEFAULT_THEME)
  if (otherThemes.length === 0) return

  // `--day` primitive — the target of the day pin
  const dayKey = getConstantKey(address, variant, { theme: DEFAULT_THEME })
  acc.rootLines.push(declarationLine(dayKey, defaultValue))

  for (const [theme, themeValue] of otherThemes) {
    // One primitive per theme, never reassigned
    const themeKey = getConstantKey(address, variant, { theme })
    acc.rootLines.push(declarationLine(themeKey, themeValue))
    if (theme === NIGHT_THEME) {
      // Night follows the OS preference and the night pin; the day pin reverses it
      acc.nightBody.push(reassignmentLine(cssKey, themeKey))
      acc.dayBody.push(reassignmentLine(cssKey, dayKey))
    } else {
      // Any other theme is pin-only (depth 1: pin bodies have no `:root` wrapper)
      const body = acc.extraThemeBodies.get(theme) ?? []
      body.push(reassignmentLine(cssKey, themeKey, 1))
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
 *
 * @param cssName - Kebab-case group name
 * @param variants - The group's variants
 * @param pkg - Prefix for the variable namespace, or undefined for core
 * @param acc - Accumulators the lines are pushed into
 * @throws when a value is an object that is neither a breakpoint map nor a theme value
 */
function processVariants(cssName: string, variants: VariantMap, pkg: string | undefined, acc: CssAccumulators): void {
  // The namespace lives in the address; options carry no identity
  const address = pkg ? `${pkg}.${cssName}` : cssName
  for (const [variant, value] of Object.entries(variants)) {
    // Checked before theme: a breakpoint map has only breakpoint keys, so it can never carry `day`
    if (isStyleValue('breakpoint', value)) {
      const cssKey = getConstantKey(address, variant)
      for (const [key, bpValue] of Object.entries(value)) {
        // null query = the key covers every viewport, so it is a plain `:root` declaration
        const query = breakpointKeyQuery(key)
        if (query === null) {
          acc.rootLines.push(declarationLine(cssKey, bpValue))
        } else {
          // Keys resolving to the same query share one block; sorted later by specificity
          const entries = acc.breakpointGroups.get(query) ?? []
          entries.push({ parsed: parseBreakpointKey(key), declaration: declarationLine(cssKey, bpValue, 2) })
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
      // Plain string or number
      acc.rootLines.push(declarationLine(getConstantKey(address, variant), value))
    }
  }
}

/**
 * Breakpoint `@media` blocks, least → most specific so the most specific wins by source order.
 *
 * Two keys can resolve to the same query (e.g. `phone` and `phone-` are both
 * `max-width` at the tablet floor minus one), so sorting happens at two levels:
 * blocks by the most specific key they contain, and declarations inside a block.
 *
 * @param breakpointGroups - Declarations grouped by resolved query
 * @returns Lines for every block, in cascade order
 */
function breakpointBlocks(breakpointGroups: Map<string, BreakpointEntry[]>): string[] {
  // A block's rank is its most specific key
  const mostSpecific = (entries: BreakpointEntry[]): ParsedBreakpointKey =>
    entries.reduce(
      (best, entry) => (compareBreakpointSpecificity(entry.parsed, best) > 0 ? entry.parsed : best),
      entries[0].parsed
    )

  return [...breakpointGroups.entries()]
    // Blocks: least specific first
    .sort(([, a], [, b]) => compareBreakpointSpecificity(mostSpecific(a), mostSpecific(b)))
    .flatMap(([query, entries]) =>
      mediaBlock(
        query,
        // Declarations inside a block: least specific first, so a later same-variable line wins
        [...entries]
          .sort((a, b) => compareBreakpointSpecificity(a.parsed, b.parsed))
          .map((entry) => entry.declaration)
      )
    )
}

export function generateTokenCSS<T extends TokenMap | RuntimeTokenMap>(tokenMap: T, prefix?: string): string {
  // `breakpoints` is reserved; everything else is tokens
  const { breakpoints, ...tokens } = tokenMap as Record<string, unknown>
  // Unprefixed calls share the '' slot, matching the key injectTokenCSS dedupes on
  const prefixKey = prefix ?? ''

  // Thresholds first, so this call's breakpoint blocks use them.
  const thresholdsChanged = breakpoints !== undefined && applyBreakpoints(breakpoints as Partial<BreakpointValues>)

  // Remember this map (replacing an earlier one for the same prefix) for future threshold changes
  tokenMapsByPrefix.set(prefixKey, tokens)

  // Earlier calls' injected CSS was built against the old thresholds — rebuild it.
  // The current prefix is skipped: its CSS is returned below for the caller to inject.
  if (thresholdsChanged) {
    for (const [storedPrefix, storedTokens] of tokenMapsByPrefix) {
      if (storedPrefix === prefixKey) continue
      injectTokenCSS(storedPrefix, buildTokenCss(storedTokens, storedPrefix || undefined))
    }
  }

  return buildTokenCss(tokens, prefix)
}

/**
 * A component override's groups keyed by dotted path (`icon.color`), found by following the
 * component's own token tree: where the tree has a branch of groups (`icon`), the override is
 * descended; where it has a group of variants (`icon.color`), the override node is that
 * group's variants. A single value at a group position (`icon: { size: "10px" }`) is its
 * `base` variant. Paths the component doesn't define are taken as one group, as before.
 *
 * @param override - The override tree under one component prefix
 * @param base - The component's generated token tree at the same position
 * @param path - Group path walked so far
 * @returns Variant maps keyed by dotted group path
 */
function componentGroups(
  override: Record<string, unknown>,
  base: ComponentTokenNode | undefined,
  path: string[] = []
): Record<string, VariantMap> {
  const groups: Record<string, VariantMap> = {}
  for (const [key, value] of Object.entries(override)) {
    const groupPath = [...path, key]
    const baseNode = typeof base === 'object' ? base[key] : undefined
    // A branch of groups in the component's tree: descend into the override
    const isBranch = typeof baseNode === 'object' && Object.values(baseNode).some((child) => typeof child === 'object')
    if (isBranch && typeof value === 'object' && value !== null) {
      Object.assign(groups, componentGroups(value as Record<string, unknown>, baseNode, groupPath))
      continue
    }
    // A single value where a group belongs overrides that group's base variant
    const single = typeof value !== 'object' || value === null || isStyleValue('theme', value) || isStyleValue('breakpoint', value)
    groups[groupPath.join('.')] = single ? { base: value as RuntimeTokenValue } : (value as VariantMap)
  }
  return groups
}

/**
 * Complete each variant's partial theme value from the token's own values, so a map that sets
 * only `day` (or only `night`) changes that theme and leaves the others as they were.
 *
 * @param address - Token address without the variant (`"color"`, `"logo.color"`)
 * @param variants - The group's variants as the map gives them
 * @returns The variants, partial theme values filled in
 */
function completeVariants(address: string, variants: VariantMap): VariantMap {
  return Object.fromEntries(
    Object.entries(variants).map(([variant, value]) => [variant, completeThemeValue(address, variant, value)])
  ) as VariantMap
}

/**
 * Register a token map (without `breakpoints`) and build its CSS.
 *
 * @param tokens - Token map with the `breakpoints` key removed
 * @param prefix - Namespace for flat tokens; component overrides use their own prefix
 * @returns The CSS string: `:root`, breakpoint blocks, theme blocks, extra theme pins
 */
function buildTokenCss(tokens: Record<string, unknown>, prefix?: string): string {
  // Separate flat tokens from component token overrides.
  const flatTokens: Record<string, VariantMap> = {}
  const componentOverrides: Record<string, Record<string, VariantMap>> = {}

  for (const [key, value] of Object.entries(tokens)) {
    if (componentPrefixes.has(key)) {
      componentOverrides[key] = Object.fromEntries(
        Object.entries(componentGroups(value as Record<string, unknown>, componentTokensData[key])).map(
          ([group, variants]) => [group, completeVariants(`${key}.${group}`, variants)]
        )
      )
    } else {
      flatTokens[key] = completeVariants(prefix ? `${prefix}.${key}` : key, value as VariantMap)
    }
  }

  // Register into the runtime layer — flat tokens under `prefix`, component
  // overrides under their component prefix — so getToken reflects every override.
  registerTokens(flatTokens, prefix)
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    registerTokens(tokenGroups, componentPrefix)
  }

  // One accumulator set for the whole call, so each section is emitted once
  const acc: CssAccumulators = {
    rootLines: [],
    nightBody: [],
    dayBody: [],
    extraThemeBodies: new Map(),
    breakpointGroups: new Map(),
  }

  // Flat groups in the call's namespace, then component groups in theirs
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
    ...[...acc.extraThemeBodies].flatMap(([theme, body]) => themePinBlock(theme, body)),
  ].join('\n')
}
