/**
 * CSS Generator
 *
 * Reads tokens.json (default theme) and tokens.dark.json (dark overrides)
 * and generates CSS custom properties files.
 *
 * ## Input
 * - src/tokens.json: Default theme (complete, source of truth)
 * - src/tokens.dark.json: Dark mode overrides (sparse, validated against default)
 * - src/errors.json: Error message templates
 *
 * ## Output
 * - dist/variables.css: Combined CSS with all tokens + dark mode
 * - dist/css/*.css: Individual CSS files per token group
 *
 * ## Validation
 * - Dark tokens must exist in default (build error if not)
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

interface TokenGroup {
  name: string
  items: Record<string, string>
}

interface Tokens {
  [key: string]: TokenGroup
}

interface DarkTokens {
  [tokenName: string]: Record<string, string>
}

interface Errors {
  [key: string]: string
}

/**
 * Format an error message with placeholder values
 */
function formatError(errors: Errors, key: string, values: Record<string, string>): string {
  let message = errors[key] || `Unknown error: ${key}`
  for (const [placeholder, value] of Object.entries(values)) {
    message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value)
  }
  return message
}

/**
 * Validate that all dark tokens exist in the default tokens
 */
function validateDarkTokens(
  defaultTokens: Tokens,
  darkTokens: DarkTokens,
  errors: Errors
): void {
  for (const [tokenName, variants] of Object.entries(darkTokens)) {
    if (!defaultTokens[tokenName]) {
      throw new Error(
        formatError(errors, "darkTokenGroupNotFound", {
          tokenName,
          available: Object.keys(defaultTokens).join(', ')
        })
      )
    }

    for (const variantName of Object.keys(variants)) {
      if (!defaultTokens[tokenName].items[variantName]) {
        throw new Error(
          formatError(errors, "darkTokenVariantNotFound", {
            tokenName,
            variantName,
            available: Object.keys(defaultTokens[tokenName].items).join(', ')
          })
        )
      }
    }
  }
}

/**
 * Main execution function
 */
function main() {
  const tokensPath = path.join(__dirname, '..', 'src', 'tokens.json')
  const darkTokensPath = path.join(__dirname, '..', 'src', 'tokens.dark.json')
  const errorsPath = path.join(__dirname, '..', 'src', 'errors.json')
  const cssPath = path.join(__dirname, '..', 'dist', 'variables.css')
  const cssDir = path.join(__dirname, '..', 'dist', 'css')

  // Read source files
  const tokens: Tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))
  const errors: Errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'))

  // Read dark tokens if they exist
  let darkTokens: DarkTokens = {}
  if (fs.existsSync(darkTokensPath)) {
    darkTokens = JSON.parse(fs.readFileSync(darkTokensPath, 'utf-8'))
    validateDarkTokens(tokens, darkTokens, errors)
    console.log('✓ Dark tokens validated')
  }

  // Build CSS
  const cssLines: string[] = []
  const darkPrimitives: string[] = []
  const darkMediaBody: string[] = []

  cssLines.push(':root {')
  cssLines.push('\tcolor-scheme: light dark;')
  cssLines.push('')

  const tokenNames = Object.keys(tokens)

  for (let i = 0; i < tokenNames.length; i++) {
    const tokenName = tokenNames[i]
    const token = tokens[tokenName]
    const darkVariants = darkTokens[tokenName] || {}

    for (const [variantName, value] of Object.entries(token.items)) {
      const cssVar = getCssConstant("core", token.name, variantName)
      cssLines.push(`\t${cssVar.key}: ${value};`)

      // If dark override exists, add primitive and media query entry
      if (darkVariants[variantName]) {
        const darkCssVar = getCssConstant("core", token.name, `${variantName}--dark`)
        darkPrimitives.push(`\t${darkCssVar.key}: ${darkVariants[variantName]};`)
        darkMediaBody.push(`\t\t${cssVar.key}: var(${darkCssVar.key});`)
      }
    }

    if (i < tokenNames.length - 1) {
      cssLines.push('')
    }
  }

  // Add dark primitives
  if (darkPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Dark mode primitives */')
    cssLines.push(...darkPrimitives)
  }

  cssLines.push('}')

  // Add dark mode media query
  if (darkMediaBody.length > 0) {
    cssLines.push('')
    cssLines.push('@media (prefers-color-scheme: dark) {')
    cssLines.push('\t:root {')
    cssLines.push(...darkMediaBody)
    cssLines.push('\t}')
    cssLines.push('}')
    cssLines.push('')
    cssLines.push('[data-theme="light"] { color-scheme: light; }')
    cssLines.push('[data-theme="dark"] { color-scheme: dark; }')
  }

  // Write output
  const distDir = path.join(__dirname, '..', 'dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  fs.writeFileSync(cssPath, cssLines.join('\n'), 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

  // Generate individual token CSS files
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true })
  }

  for (const tokenName of tokenNames) {
    const token = tokens[tokenName]
    const darkVariants = darkTokens[tokenName] || {}
    const lines: string[] = []
    const primitives: string[] = []
    const mediaBody: string[] = []

    lines.push(':root {')

    for (const [variantName, value] of Object.entries(token.items)) {
      const cssVar = getCssConstant("core", token.name, variantName)
      lines.push(`\t${cssVar.key}: ${value};`)

      if (darkVariants[variantName]) {
        const darkCssVar = getCssConstant("core", token.name, `${variantName}--dark`)
        primitives.push(`\t${darkCssVar.key}: ${darkVariants[variantName]};`)
        mediaBody.push(`\t\t${cssVar.key}: var(${darkCssVar.key});`)
      }
    }

    if (primitives.length > 0) {
      lines.push('')
      lines.push('\t/* Dark mode primitives */')
      lines.push(...primitives)
    }

    lines.push('}')

    if (mediaBody.length > 0) {
      lines.push('')
      lines.push('@media (prefers-color-scheme: dark) {')
      lines.push('\t:root {')
      lines.push(...mediaBody)
      lines.push('\t}')
      lines.push('}')
    }

    fs.writeFileSync(path.join(cssDir, `${tokenName}.css`), lines.join('\n'), 'utf-8')
  }

  console.log(`✓ Generated: ${tokenNames.length} files in ${cssDir}`)
}

main()