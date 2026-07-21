/**
 * CSS file writer.
 *
 * Takes resolved token data from readSources and produces all CSS output files.
 * Delegates to the emitter and assembler pipeline in scripts/css/.
 *
 * ## Output files
 *
 * | File | Contents |
 * |------|----------|
 * | `dist/tokens.css` | Combined :root block with all semantic variables, primitives, breakpoint @media blocks, and auto dark mode @media (prefers-color-scheme) |
 * | `dist/breakpoints.css` | Native breakpoint utility classes (plain @import, no consumer transform) |
 * | `dist/breakpoints.custom-media.css` | OPTIONAL @custom-media aliases (requires postcss-custom-media) |
 * | `dist/css/{group}.css` | Individual per-group CSS files for selective imports |
 *
 * ## Standalone CSS assets ({@link STANDALONE_ASSETS})
 *
 * Every top-level asset that isn't `tokens.css` or a per-group file is declared
 * once in the {@link STANDALONE_ASSETS} manifest: `{ file, build }`. The writer
 * loops the manifest, so adding a new asset (elevation, motion utilities, …) is
 * one entry + one emitter — and the contract (each `build` returns plain,
 * browser-native CSS consumed by a bare `@import`) keeps the set uniform as it
 * grows. Register the matching `./<file>` in `package.json` exports.
 */

import * as fs from 'fs'
import * as path from 'path'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import { buildIndividualCss } from '../css/emitCoreTokens.js'
import { buildCombinedCss } from '../css/assembleCombined.js'
import { buildCustomMediaCss } from '../css/emitCustomMedia.js'
import { buildBreakpointUtilitiesCss } from '../css/emitBreakpointUtilities.js'
import type { TokenSources } from './readSources.js'

/**
 * Standalone top-level CSS assets. Each `build` returns plain, browser-native
 * CSS (the plain-`@import`, zero-consumer-transform contract). Add an entry to
 * ship a new asset — and register `./<file>` in package.json exports.
 *
 * `breakpoints.custom-media.css` is the one intentional exception to the native
 * contract (needs postcss-custom-media) — shipped as an opt-in, never required.
 */
const STANDALONE_ASSETS: { file: string; build: () => string }[] = [
  { file: 'breakpoints.css', build: buildBreakpointUtilitiesCss },
  { file: 'breakpoints.custom-media.css', build: buildCustomMediaCss },
]

/**
 * Generates all CSS output files from resolved token data.
 *
 * @param sources - Merged token data from readTokenSources
 * @param distDir - Absolute path to dist/
 * @param cssDir - Absolute path to dist/css/
 */
export function writeCssFiles(sources: TokenSources, distDir: string, cssDir: string): void {
  const {
    tokens, nightTokens, componentTokens, componentNightTokens, sizeTokens,
    componentBreakpointTokens, extraThemes, componentExtraThemes,
    inverseTokens, inverseNightTokens,
  } = sources

  // Ensure output directories exist
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true })

  // Combined tokens.css — semantic variables, primitives (incl. inverse),
  // breakpoint @media, and the mode-awareness block.
  const { css: combinedCss } = buildCombinedCss(
    tokens, nightTokens, componentTokens, componentNightTokens, sizeTokens,
    componentBreakpointTokens, extraThemes, componentExtraThemes,
    inverseTokens, inverseNightTokens
  )
  const cssPath = path.join(distDir, 'tokens.css')
  fs.writeFileSync(cssPath, combinedCss, 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

  // Standalone assets (breakpoint utilities + optional custom-media, …) — one
  // pass over the manifest so growth is a single entry.
  for (const { file, build } of STANDALONE_ASSETS) {
    const assetPath = path.join(distDir, file)
    fs.writeFileSync(assetPath, build(), 'utf-8')
    console.log(`✓ Generated: ${assetPath}`)
  }

  // Individual per-group CSS files for selective imports (dist/css/{group}.css).
  // Groups with an inverse dimension (color / backgroundColor) carry their
  // --inverse vars in the same file.
  const tokenNames = Object.keys(tokens)
  for (const tokenName of tokenNames) {
    const cssName = camelToKebab(tokenName)
    const nightVariants = nightTokens[tokenName] || {}
    const css = buildIndividualCss(
      cssName, tokens[tokenName], nightVariants,
      inverseTokens[tokenName], inverseNightTokens[tokenName]
    )
    fs.writeFileSync(path.join(cssDir, `${tokenName}.css`), css, 'utf-8')
  }
  console.log(`✓ Generated: ${tokenNames.length} files in ${cssDir}`)
}
