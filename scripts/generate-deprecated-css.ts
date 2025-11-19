import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { deprecatedMappings } from '../src/deprecated.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generate deprecated.css from the deprecated mappings data
 */
function generateDeprecatedCSS(): void {
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

generateDeprecatedCSS()