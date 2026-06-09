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
 * | `dist/tokens.css` | Combined :root block with all semantic variables, primitives, breakpoint @media blocks, auto dark mode @media (prefers-color-scheme), and the shorthand-alias block appended at the end |
 * | `dist/shorthand.css` | Standalone copy of the `base`-less aliases (module + component) — same block appended to tokens.css, also available for selective import |
 * | `dist/css/{group}.css` | Individual per-group CSS files for selective imports |
 */

import * as fs from 'fs'
import * as path from 'path'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import { buildIndividualCss } from '../css/emitCoreTokens.js'
import { buildCombinedCss } from '../css/assembleCombined.js'
import type { TokenSources } from './readSources.js'

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
  } = sources

  // Ensure output directories exist
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true })

  // Combined tokens.css — semantic variables, primitives, breakpoint @media, and mode awareness block
  const { css: combinedCss, shorthandCss } = buildCombinedCss(
    tokens, nightTokens, componentTokens, componentNightTokens, sizeTokens,
    componentBreakpointTokens, extraThemes, componentExtraThemes
  )
  // tokens.css carries the shorthand block appended at the end, so every
  // consumer of `nice-styles/tokens.css` (via StylesProvider) gets the aliases
  // with no extra import. var() resolves at use time, so appending after the
  // canonical declarations is order-independent.
  const cssPath = path.join(distDir, 'tokens.css')
  fs.writeFileSync(cssPath, `${combinedCss}\n\n${shorthandCss}`, 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

  // Standalone copy — the same alias block, for consumers who want only the
  // shorthands (or to read/diff them in isolation). Exported as
  // "nice-styles/shorthand.css".
  const shorthandPath = path.join(distDir, 'shorthand.css')
  fs.writeFileSync(shorthandPath, shorthandCss, 'utf-8')
  console.log(`✓ Generated: ${shorthandPath}`)

  // Individual per-group CSS files for selective imports (dist/css/{group}.css)
  const tokenNames = Object.keys(tokens)
  for (const tokenName of tokenNames) {
    const cssName = camelToKebab(tokenName)
    const nightVariants = nightTokens[tokenName] || {}
    const css = buildIndividualCss(cssName, tokens[tokenName], nightVariants)
    fs.writeFileSync(path.join(cssDir, `${tokenName}.css`), css, 'utf-8')
  }
  console.log(`✓ Generated: ${tokenNames.length} files in ${cssDir}`)
}
