/**
 * Generate the CSS string for a token map and register the tokens.
 *
 * Framework-agnostic core of `createTokens`. Takes a token map (flat tokens,
 * component-prefix overrides, optional top-level `breakpoints` key), registers
 * the flat tokens, forwards `breakpoints` to `setBreakpoints`, and builds the
 * full `:root` + `@media` CSS string. Returns the string for the caller to do
 * with as it pleases (typically `injectTokenCSS`).
 *
 * Side effects, in order:
 *   1. If `tokenMap.breakpoints` is set, calls `setBreakpoints(...)`.
 *   2. Calls `registerTokens(flatTokens, prefix)`.
 *
 * The output CSS string contains a `:root` block (defaults + non-default
 * primitives) plus per-theme and per-breakpoint `@media` blocks that reassign
 * the semantic vars at runtime.
 *
 * @param tokenMap - Token map. Top-level keys may include:
 *   - Token group names (`fontSize`, `gap`, …) for flat tokens.
 *   - Known component prefixes (`button`, `icon`, …) for 3-level component
 *     overrides.
 *   - The literal key `breakpoints` for runtime breakpoint-threshold overrides.
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
import { getBreakpoint } from './getBreakpoint.js'
import { setBreakpoints } from './setBreakpoints.js'
import { registerTokens } from '../registry/index.js'
import componentTokensData from '../generated/componentTokensData.js'
import {
  DEFAULT_THEME,
  DEFAULT_BREAKPOINT,
} from '../constants/styleValues.js'
import {
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointValues,
} from '../constants/breakpoints.js'
import type { TokenMap } from '../utilities/getTokenFromMap.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

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
 * - BreakpointValue: `{ phone: "14px", laptop: "20px" }` → default + breakpoint primitives + breakpoint media entries
 *
 * BreakpointValue is checked before ThemeValue — they are mutually exclusive on the same variant.
 */
function processVariants(
  cssName: string,
  variants: VariantMap,
  pkg: string | undefined,
  defaultDeclarations: string[],
  themeDeclarations: Map<string, string[]>,
  breakpointDeclarations: Map<string, string[]>
): void {
  for (const [variant, value] of Object.entries(variants)) {
    if (isStyleValue('breakpoint', value)) {
      const defaultValue = value[DEFAULT_BREAKPOINT]
      const cssKey = getConstantKey(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssKey}: ${defaultValue};`)

      for (const [breakpoint, bpValue] of Object.entries(value)) {
        if (breakpoint !== DEFAULT_BREAKPOINT) {
          const bpCssKey = getConstantKey(cssName, variant, { breakpoint, pkg })
          defaultDeclarations.push(`${bpCssKey}: ${bpValue};`)

          const declarations = breakpointDeclarations.get(breakpoint)
          if (declarations) {
            declarations.push(`${cssKey}: var(${bpCssKey});`)
          }
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
    } else {
      const cssKey = getConstantKey(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssKey}: ${value};`)
    }
  }
}

/**
 * Scan a variant map for theme and breakpoint dimension keys. Populates the
 * shared themes/breakpoints sets so the declaration maps can be pre-initialized
 * before processing.
 */
function collectDimensions(variants: VariantMap, themes: Set<string>, breakpoints: Set<string>): void {
  for (const value of Object.values(variants)) {
    if (isStyleValue('breakpoint', value)) {
      for (const bp of Object.keys(value)) {
        breakpoints.add(bp)
      }
    } else if (isStyleValue('theme', value)) {
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
  // Separate flat tokens from component token overrides and breakpoint config.
  const flatTokens: Record<string, VariantMap> = {}
  const componentOverrides: Record<string, Record<string, VariantMap>> = {}
  let breakpointOverrides: Partial<BreakpointValues> | undefined

  for (const [key, value] of Object.entries(tokenMap)) {
    if (key === 'breakpoints') {
      breakpointOverrides = value as Partial<BreakpointValues>
    } else if (componentPrefixes.has(key)) {
      componentOverrides[key] = value as Record<string, VariantMap>
    } else {
      flatTokens[key] = value as VariantMap
    }
  }

  // Apply breakpoint overrides BEFORE token CSS is emitted so the @media
  // thresholds used below reflect the new values.
  if (breakpointOverrides) {
    setBreakpoints(breakpointOverrides)
  }

  // Register flat tokens — component overrides work via CSS variable cascade.
  registerTokens(flatTokens, prefix)

  // Collect themes and breakpoints from flat tokens and component overrides.
  const themes = new Set<string>([DEFAULT_THEME])
  const breakpoints = new Set<string>([DEFAULT_BREAKPOINT])

  for (const variants of Object.values(flatTokens)) {
    collectDimensions(variants, themes, breakpoints)
  }
  for (const tokenGroups of Object.values(componentOverrides)) {
    for (const variants of Object.values(tokenGroups)) {
      collectDimensions(variants, themes, breakpoints)
    }
  }

  // Initialize declaration accumulators.
  const defaultDeclarations: string[] = []
  const themeDeclarations: Map<string, string[]> = new Map()
  for (const theme of themes) {
    if (theme !== DEFAULT_THEME) themeDeclarations.set(theme, [])
  }
  const breakpointDeclarations: Map<string, string[]> = new Map()
  for (const bp of breakpoints) {
    if (bp !== DEFAULT_BREAKPOINT) breakpointDeclarations.set(bp, [])
  }

  // Flat tokens — 2-level: tokenName -> variant.
  for (const [tokenKey, variants] of Object.entries(flatTokens)) {
    processVariants(camelToKebab(tokenKey), variants, prefix, defaultDeclarations, themeDeclarations, breakpointDeclarations)
  }

  // Component token overrides — 3-level: prefix -> tokenName -> variant.
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    for (const [tokenName, variants] of Object.entries(tokenGroups)) {
      processVariants(camelToKebab(tokenName), variants, componentPrefix, defaultDeclarations, themeDeclarations, breakpointDeclarations)
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

  // Breakpoint media queries — always active (not opt-in), phone-first via min-width.
  const breakpointQueries: Record<string, string> = {
    [BREAKPOINT_TABLET]: getBreakpoint(BREAKPOINT_TABLET),
    [BREAKPOINT_LAPTOP]: getBreakpoint(BREAKPOINT_LAPTOP),
    [BREAKPOINT_DESKTOP]: getBreakpoint(BREAKPOINT_DESKTOP),
  }

  for (const [bp, declarations] of breakpointDeclarations.entries()) {
    if (declarations.length > 0) {
      const query = breakpointQueries[bp]
      if (query) {
        cssString += `
    ${query} {
      :root {
        ${declarations.join('\n        ')}
      }
    }
    `
      }
    }
  }

  return cssString
}