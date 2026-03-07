/**
 * CSS Generator (orchestrator)
 *
 * Reads core tokens (flat), color module (day + night), and component tokens
 * (day + night), then runs the pipeline: validate → emit → assemble → write.
 *
 * ## CLI
 *
 * ```bash
 * # One-shot build (used by npm run build:css)
 * node --loader ts-node/esm scripts/generateCss.ts
 *
 * # Watch mode (used by npm run dev)
 * node --loader ts-node/esm scripts/generateCss.ts --watch
 * ```
 *
 * ## Input
 *
 * - `src/tokens/core.json` — Flat core tokens: { group: { item: value } }
 * - `src/tokens/module.color.json` — Color module: { day: { group: { item: value } }, night: { ... } }
 * - `src/tokens/component.json` — Component tokens (unchanged): { day: { prefix: { ... } }, night: { ... } }
 *
 * ## Output
 *
 * - `dist/variables.css` — Combined CSS with all tokens + mode primitives
 * - `dist/color-scheme.css` — Opt-in auto dark mode
 * - `dist/css/*.css` — Individual CSS files per core token group
 *
 * @module generate-css
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { camelToKebab } from '../src/utilities/camelToKebab.js'
import type { Tokens, NightTokens, ComponentTokens, Errors } from './css/types.js'
import { validateNightTokens, validateComponentNightTokens } from './css/validate.js'
import { buildIndividualCss } from './css/emitCoreTokens.js'
import { buildCombinedCss } from './css/assembleCombined.js'
import { buildColorSchemeCss } from './css/assembleColorScheme.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function main() {
  const tokensDir = path.join(__dirname, '..', 'src', 'tokens')
  const distDir = path.join(__dirname, '..', 'dist')
  const cssDir = path.join(distDir, 'css')
  const errorsPath = path.join(__dirname, '..', 'src', 'errors.json')

  // Read core tokens (flat — no day/night wrapper)
  const tokens: Tokens = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'core.json'), 'utf-8')
  )

  // Read color module — night overrides come from here instead of core.json
  const colorJson = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'module.color.json'), 'utf-8')
  )
  const colorDay: NightTokens = colorJson.day || {}
  const nightTokens: NightTokens = colorJson.night || {}

  // Validate color module: night entries must have corresponding day entries
  const errors: Errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'))
  if (Object.keys(nightTokens).length > 0) {
    validateNightTokens(colorDay, nightTokens, errors)
    console.log('✓ Color module night tokens validated')
  }

  // Read component tokens (unchanged — still uses day/night wrapper)
  const componentJson = JSON.parse(
    fs.readFileSync(path.join(tokensDir, 'component.json'), 'utf-8')
  )
  const componentTokens: ComponentTokens = componentJson.day
  const componentNightTokens: ComponentTokens = componentJson.night || {}
  const componentCount = Object.keys(componentTokens).length
  if (componentCount > 0) {
    console.log(`✓ Loaded ${componentCount} component token sets: ${Object.keys(componentTokens).join(', ')}`)
  }

  if (Object.keys(componentNightTokens).length > 0) {
    validateComponentNightTokens(componentTokens, componentNightTokens)
    console.log('✓ Component night tokens validated')
  }

  // Ensure output directories exist
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true })

  // Generate combined variables.css
  const { css: combinedCss, nightMediaBody } = buildCombinedCss(
    tokens, nightTokens, componentTokens, componentNightTokens
  )
  const cssPath = path.join(distDir, 'variables.css')
  fs.writeFileSync(cssPath, combinedCss, 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

  // Generate color-scheme.css
  const colorSchemePath = path.join(distDir, 'color-scheme.css')
  fs.writeFileSync(colorSchemePath, buildColorSchemeCss(nightMediaBody), 'utf-8')
  console.log(`✓ Generated: ${colorSchemePath}`)

  // Generate individual per-token CSS files
  const tokenNames = Object.keys(tokens)
  for (const tokenName of tokenNames) {
    const cssName = camelToKebab(tokenName)
    const nightVariants = nightTokens[tokenName] || {}
    const css = buildIndividualCss(cssName, tokens[tokenName], nightVariants)
    fs.writeFileSync(path.join(cssDir, `${tokenName}.css`), css, 'utf-8')
  }
  console.log(`✓ Generated: ${tokenNames.length} files in ${cssDir}`)
}

main()

if (process.argv.includes('--watch')) {
  const tokensDir = path.join(__dirname, '..', 'src', 'tokens')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  fs.watch(tokensDir, { recursive: true }, (_eventType, filename) => {
    if (!filename?.endsWith('.json')) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      console.log(`\nToken change detected: ${filename}`)
      try {
        main()
      } catch (error) {
        console.error('Error regenerating CSS:', error)
      }
    }, 200)
  })

  console.log(`Watching ${tokensDir} for changes...`)
}