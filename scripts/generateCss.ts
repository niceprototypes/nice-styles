/**
 * CSS Generator
 *
 * This script reads tokens.json and generates CSS custom properties files.
 * It's the primary CSS generation script for the design system.
 *
 * ## Purpose
 * Converts design tokens from JSON format into usable CSS custom properties
 * that can be imported into web applications.
 *
 * ## Input
 * - src/tokens.json: Central token definitions in JSON format
 *   Structure: { "tokenGroup": { "name": "css-prefix", "items": { "key": "value" } } }
 *
 * ## Output
 * - dist/variables.css: Combined CSS file with all tokens in :root
 * - dist/css/*.css: Individual CSS files per token group (14 files)
 *
 * ## Features
 * - Converts camelCase keys to kebab-case CSS variables
 * - Groups tokens by category with blank line separators
 * - Generates both combined and per-token CSS files
 *
 * ## Usage
 * Run via: npm run build:css
 * Part of: npm run build
 * Watch mode: npm run watch (includes this script with file watching)
 *
 * ## Architecture Note
 * This replaces the old generateTokens.ts which relied on constants.ts.
 * The new approach uses tokens.json as the single source of truth.
 *
 * @module generate-css
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { getCssConstant } from '../src/services/getCssConstant.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Main execution function
 *
 * Orchestrates the entire CSS generation process:
 * 1. Reads tokens.json from src/
 * 2. Generates dist/variables.css with all tokens
 * 3. Generates individual CSS files in dist/css/ per token group
 *
 * Creates output directories if they don't exist.
 */
function main() {
  // Define file paths
  const tokensPath = path.join(__dirname, '..', 'src', 'tokens.json')
  const cssPath = path.join(__dirname, '..', 'dist', 'variables.css')
  const cssDir = path.join(__dirname, '..', 'dist', 'css')

  // Read tokens.json
  const tokensContent = fs.readFileSync(tokensPath, 'utf-8')
  const tokens = JSON.parse(tokensContent)

  // Generate combined CSS file with all tokens
  const cssLines: string[] = []
  cssLines.push(':root {')

  const tokenNames = Object.keys(tokens)
  for (let i = 0; i < tokenNames.length; i++) {
    const tokenName = tokenNames[i]
    const token = tokens[tokenName]
    const items = token.items

    // Add each CSS variable for this token
    for (const [key, value] of Object.entries(items)) {
      const cssVar = getCssConstant("core", token.name, key)
      cssLines.push(`\t${cssVar.key}: ${value};`)
    }

    // Add blank line between tokens (except after the last one)
    if (i < tokenNames.length - 1) {
      cssLines.push('')
    }
  }

  cssLines.push('}')

  // Ensure dist directory exists
  const distDir = path.join(__dirname, '..', 'dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  // Write combined CSS file
  fs.writeFileSync(cssPath, cssLines.join('\n'), 'utf-8')
  console.log(`✓ Generated CSS file: ${cssPath}`)

  // Generate individual CSS files per token
  // Ensure the output directory exists
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true })
  }

  // Create a separate CSS file for each token
  for (const tokenName of tokenNames) {
    const token = tokens[tokenName]
    const items = token.items
    const tokenCssLines: string[] = []
    tokenCssLines.push(':root {')

    // Add all CSS variables for this token
    for (const [key, value] of Object.entries(items)) {
      const cssVar = getCssConstant("core", token.name, key)
      tokenCssLines.push(`\t${cssVar.key}: ${value};`)
    }

    tokenCssLines.push('}')

    // Write the individual token CSS file
    const tokenCssPath = path.join(cssDir, `${tokenName}.css`)
    fs.writeFileSync(tokenCssPath, tokenCssLines.join('\n'), 'utf-8')
  }

  console.log(`✓ Generated ${tokenNames.length} individual CSS files in: ${cssDir}`)
}

// Run the main function
main()