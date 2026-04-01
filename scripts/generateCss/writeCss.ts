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
 * | `dist/variables.css` | Combined :root block with all semantic variables, primitives, and @media breakpoint blocks |
 * | `dist/color-scheme.css` | Opt-in auto dark mode (@media prefers-color-scheme) |
 * | `dist/css/{group}.css` | Individual per-group CSS files for selective imports |
 */

import * as fs from 'fs'
import * as path from 'path'
import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import { buildIndividualCss } from '../css/emitCoreTokens.js'
import { buildCombinedCss } from '../css/assembleCombined.js'
import { buildColorSchemeCss } from '../css/assembleColorScheme.js'
import type { TokenSources } from './readSources.js'

/**
 * Generates all CSS output files from resolved token data.
 *
 * @param sources - Merged token data from readTokenSources
 * @param distDir - Absolute path to dist/
 * @param cssDir - Absolute path to dist/css/
 */
export function writeCssFiles(sources: TokenSources, distDir: string, cssDir: string): void {
  const { tokens, nightTokens, componentTokens, componentNightTokens, sizeTokens } = sources

  // Ensure output directories exist
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true })

  // Combined variables.css — all semantic variables, primitives, and breakpoint @media blocks
  const { css: combinedCss, nightMediaBody } = buildCombinedCss(
    tokens, nightTokens, componentTokens, componentNightTokens, sizeTokens
  )
  const cssPath = path.join(distDir, 'variables.css')
  fs.writeFileSync(cssPath, combinedCss, 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

  // color-scheme.css — opt-in auto dark mode via @media (prefers-color-scheme: dark)
  const colorSchemePath = path.join(distDir, 'color-scheme.css')
  fs.writeFileSync(colorSchemePath, buildColorSchemeCss(nightMediaBody), 'utf-8')
  console.log(`✓ Generated: ${colorSchemePath}`)

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
