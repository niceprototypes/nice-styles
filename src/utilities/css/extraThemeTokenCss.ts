/**
 * Extra theme CSS emitter — every named theme other than `night`.
 *
 * `night` is the one theme mapped to `@media (prefers-color-scheme: dark)`
 * (`coreTokenCss.ts`, `componentTokenCss.ts`). Any other theme under a `$themes`
 * key (e.g. `sepia`) is pin-only: it activates solely through
 * `[data-theme="{theme}"]`, which `<Theme>` and `applyTheme` set for any name.
 *
 * Used by `scripts/css/assembleCombined.ts` for `dist/tokens.css`.
 *
 * ## Input
 * - Core: `model.themes.extras` — flat groups keyed by theme name.
 * - Component: `model.components.themes.extras` — partial trees keyed by prefix, then theme.
 *
 * ## Output
 * - `primitiveLines` — inside `:root`: one `--{theme}` primitive per overridden variable.
 * - `pinBlocks` — after `:root`: one `[data-theme="{theme}"]` block per theme,
 *   reassigning each semantic variable to its primitive.
 *
 * @example
 * generateExtraThemeCss({ sepia: { color: { base: "#5b4636" } } })
 * // primitiveLines: ["", "\t/* Extra theme primitives *\/", "\t--np--color--sepia: #5b4636;"]
 * // pinBlocks:      ["", '[data-theme="sepia"] {', "\t--np--color: var(--np--color--sepia);", "}"]
 */

import { getConstantKey } from '../../services/getConstant.js'
import { camelToKebab } from '../camelToKebab.js'
import { pinBlock } from './blocks.js'
import { declarationLine, reassignmentLine } from './declarations.js'
import { walkTokenTree } from './treeWalk.js'
import type { DimensionTokens, TokenTree } from './types.js'

/** Lines produced by the extra theme emitters. */
export interface ExtraThemeCss {
  /** `--{theme}` primitive declarations for inside `:root` (with section header) */
  primitiveLines: string[]
  /** `[data-theme="{theme}"]` blocks for after `:root` */
  pinBlocks: string[]
}

/**
 * Core (flat) extra themes.
 *
 * @param extraThemes - Flat token groups keyed by theme name; must not include `night`
 * @returns Primitive lines and pin blocks; both empty when there are no extra themes
 */
export function generateExtraThemeCss(extraThemes: DimensionTokens): ExtraThemeCss {
  // No extra themes — no section header either
  const themeNames = Object.keys(extraThemes)
  if (themeNames.length === 0) return { primitiveLines: [], pinBlocks: [] }

  // One primitives section shared by every theme; one pin block per theme
  const primitiveLines: string[] = ['', '\t/* Extra theme primitives */']
  const pinBlocks: string[] = []

  for (const theme of themeNames) {
    const pinBody: string[] = []
    for (const [group, variants] of Object.entries(extraThemes[theme])) {
      const cssName = camelToKebab(group)
      for (const [variant, value] of Object.entries(variants)) {
        // `--np--{group}--{variant}--{theme}` holds the value; the pin points the semantic var at it.
        // Depth 1: pin blocks have no inner `:root`
        const primitive = getConstantKey(cssName, variant, { theme })
        primitiveLines.push(declarationLine(primitive, value))
        pinBody.push(reassignmentLine(getConstantKey(cssName, variant), primitive, 1))
      }
    }
    pinBlocks.push(...pinBlock(theme, pinBody))
  }

  return { primitiveLines, pinBlocks }
}

/**
 * Component (nested) extra themes. Grouped by theme, so each theme gets one pin
 * block spanning every component.
 *
 * @param componentExtraThemes - Partial override trees keyed by prefix, then theme
 * @returns Primitive lines and pin blocks; both empty when no component defines an extra theme
 */
export function generateComponentExtraThemeCss(
  componentExtraThemes: Record<string, Record<string, TokenTree>>
): ExtraThemeCss {
  // Collect theme names across components (input is prefix → theme; output is per theme)
  const themeNames = new Set(Object.values(componentExtraThemes).flatMap((byTheme) => Object.keys(byTheme)))
  if (themeNames.size === 0) return { primitiveLines: [], pinBlocks: [] }

  const primitiveLines: string[] = ['', '\t/* Component extra theme primitives */']
  const pinBlocks: string[] = []

  for (const theme of themeNames) {
    const pinBody: string[] = []
    for (const [prefix, byTheme] of Object.entries(componentExtraThemes)) {
      const tree = byTheme[theme]
      if (!tree) continue
      // The override tree holds only overridden leaves — every leaf emits
      walkTokenTree(tree, (path, value) => {
        const primitive = getConstantKey(`${prefix}.${path.join('.')}`, { theme })
        primitiveLines.push(declarationLine(primitive, value))
        pinBody.push(reassignmentLine(getConstantKey(`${prefix}.${path.join('.')}`), primitive, 1))
      })
    }
    pinBlocks.push(...pinBlock(theme, pinBody))
  }

  return { primitiveLines, pinBlocks }
}
