/**
 * Extra alt-theme CSS emitter (additive).
 *
 * The day/night path (emitCoreTokens + emitComponentTokens + assembleCombined)
 * owns the OS-default dark theme — `night` is the single theme mapped to
 * `@media (prefers-color-scheme: dark)`. This emitter handles any *other* named
 * theme found under a `$themes` key (e.g. "sepia"): for each overridden variant
 * it emits a stable `--{var}--{theme}` primitive plus a `[data-theme="{theme}"]`
 * pin block that reassigns the semantic vars to those primitives.
 *
 * Extra themes are pin-only by design — only one theme can be the OS dark
 * default, so additional themes activate solely via an explicit `data-theme`
 * pin (which the React `Theme` component already sets for any name).
 */

import { getConstantKey } from '../../src/services/getConstant.js'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import { buildCssKey } from './emitComponentTokens.js'
import type { Tokens, TokenNode } from './types.js'

export interface ExtraThemeResult {
  /** `--{var}--{theme}` primitive lines for inside :root */
  primitiveLines: string[]
  /** Complete `[data-theme="{theme}"] { … }` pin blocks for after :root */
  pinBlocks: string[]
}

/** Append a `[data-theme="{theme}"]` pin block. No-op when the body is empty. */
function pushPinBlock(blocks: string[], theme: string, body: string[]): void {
  if (body.length === 0) return
  blocks.push('')
  blocks.push(`[data-theme="${theme}"] {`)
  blocks.push(...body)
  blocks.push('}')
}

/**
 * Module (flat) extra themes: `{ themeName: { group: { variant: value } } }`.
 * `night` is handled by the day/night path and must not appear here.
 */
export function generateExtraThemeCss(extraThemes: Record<string, Tokens>): ExtraThemeResult {
  const primitiveLines: string[] = []
  const pinBlocks: string[] = []
  const themeNames = Object.keys(extraThemes)
  if (themeNames.length === 0) return { primitiveLines, pinBlocks }

  primitiveLines.push('')
  primitiveLines.push('\t/* Extra theme primitives */')

  for (const theme of themeNames) {
    const pinBody: string[] = []
    for (const [group, variants] of Object.entries(extraThemes[theme])) {
      const cssName = camelToKebab(group)
      for (const [variant, value] of Object.entries(variants)) {
        const primitive = getConstantKey(cssName, variant, { theme })
        primitiveLines.push(`\t${primitive}: ${value};`)
        pinBody.push(`\t${getConstantKey(cssName, variant)}: var(${primitive});`)
      }
    }
    pushPinBlock(pinBlocks, theme, pinBody)
  }
  return { primitiveLines, pinBlocks }
}

/** Recursively emit primitive + pin lines for one component's theme override tree. */
function walkTheme(
  prefix: string,
  themeNode: { [key: string]: TokenNode },
  path: string[],
  theme: string,
  primOut: string[],
  pinOut: string[]
): void {
  for (const [key, value] of Object.entries(themeNode)) {
    const newPath = [...path, key]
    if (typeof value === 'string') {
      const cssKey = buildCssKey(prefix, newPath)
      primOut.push(`\t${cssKey}--${theme}: ${value};`)
      pinOut.push(`\t${cssKey}: var(${cssKey}--${theme});`)
    } else if (value && typeof value === 'object') {
      walkTheme(prefix, value as { [key: string]: TokenNode }, newPath, theme, primOut, pinOut)
    }
  }
}

/**
 * Component (nested) extra themes: `{ prefix: { themeName: partialTree } }`.
 * Grouped by theme so each theme gets one block spanning every prefix.
 */
export function generateComponentExtraThemeCss(
  componentExtraThemes: Record<string, Record<string, { [key: string]: TokenNode }>>
): ExtraThemeResult {
  const primitiveLines: string[] = []
  const pinBlocks: string[] = []

  const themeNames = new Set<string>()
  for (const byTheme of Object.values(componentExtraThemes)) {
    for (const theme of Object.keys(byTheme)) themeNames.add(theme)
  }
  if (themeNames.size === 0) return { primitiveLines, pinBlocks }

  primitiveLines.push('')
  primitiveLines.push('\t/* Component extra theme primitives */')

  for (const theme of themeNames) {
    const pinBody: string[] = []
    for (const [prefix, byTheme] of Object.entries(componentExtraThemes)) {
      const tree = byTheme[theme]
      if (tree) walkTheme(prefix, tree, [], theme, primitiveLines, pinBody)
    }
    pushPinBlock(pinBlocks, theme, pinBody)
  }
  return { primitiveLines, pinBlocks }
}
