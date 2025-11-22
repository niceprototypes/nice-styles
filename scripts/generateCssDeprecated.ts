/**
 * Deprecated CSS Generator
 *
 * This script generates deprecated.css which provides backward compatibility
 * for CSS custom properties that have been renamed.
 *
 * ## Purpose
 * When CSS variables are renamed in the design system, this script creates
 * alias variables that point to the new names, allowing legacy code to
 * continue working without immediate updates.
 *
 * ## Input
 * - src/deprecated-mappings.json: Maps current variable names to deprecated names
 *   Format: { "current-var-name": ["deprecated-var-1", "deprecated-var-2"] }
 *
 * ## Output
 * - dist/deprecated.css: CSS file with deprecated variable aliases
 *   Example: --border-color-dark: var(--border-color-heavy);
 *
 * ## Usage
 * Run via: npm run build:deprecated
 * Part of: npm run build
 *
 * @module generate-deprecated-css
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generate deprecated.css from the deprecated mappings data
 *
 * Reads deprecated-mappings.json and creates CSS custom property aliases
 * that map old variable names to their current equivalents.
 *
 * @example
 * // Given deprecated-mappings.json:
 * {
 *   "border-color-heavy": ["border-color-dark"],
 *   "border-color-heavier": ["border-color-darker"]
 * }
 *
 * // Generates deprecated.css:
 * :root {
 *   --border-color-dark: var(--border-color-heavy);
 *   --border-color-darker: var(--border-color-heavier);
 * }
 */
function generateCssDeprecated(): void {
  // Read deprecated mappings from JSON
  const mappingsPath = path.join(__dirname, '../src/deprecated-mappings.json')
  const deprecatedMappings: Record<string, string[]> = JSON.parse(
    fs.readFileSync(mappingsPath, 'utf-8')
  )

  const lines: string[] = []

  // Add file header
  lines.push('/**')
  lines.push(' * Deprecated CSS Variables')
  lines.push(' *')
  lines.push(' * This file contains deprecated CSS custom properties that alias to their new equivalents.')
  lines.push(' * Import this file to maintain backward compatibility with older code.')
  lines.push(' *')
  lines.push(' * These variables will be removed in v5.0.0')
  lines.push(' *')
  lines.push(' * Usage:')
  lines.push(' * @import \'nice-styles/deprecated.css\';')
  lines.push(' */')
  lines.push('')
  lines.push(':root {')

  // Generate CSS variables from mappings
  for (const [currentVar, deprecatedVars] of Object.entries(deprecatedMappings)) {
    for (const deprecatedVar of deprecatedVars) {
      lines.push(`\t--${deprecatedVar}: var(--${currentVar});`)
    }
  }

  lines.push('}')
  lines.push('')

  // Write to dist/deprecated.css
  const outputPath = path.join(__dirname, '../dist/deprecated.css')
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8')

  console.log(`✓ Generated deprecated CSS file: ${outputPath}`)
}

generateCssDeprecated()