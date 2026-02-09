/**
 * CSS Generator
 *
 * Reads tokens.json (default/light theme) and tokens.dark.json (dark overrides)
 * and generates CSS custom properties files.
 *
 * ## Input
 * - src/tokens.json: Default theme in flat format { tokenName: { variant: value } }
 * - src/tokens.dark.json: Dark mode overrides (sparse, validated against default)
 * - src/errors.json: Error message templates
 *
 * ## Output
 * - dist/variables.css: Combined CSS with all tokens + mode primitives + dark media query
 * - dist/css/*.css: Individual CSS files per token group
 *
 * ## Generated CSS Structure
 *
 * For each token, the generator produces:
 *
 * 1. **Semantic variables** — the default values, used by components:
 *    `--np--background-color--base: hsla(0, 100%, 100%, 1);`
 *
 * 2. **Light primitives** — stable references to light values, never reassigned by media queries.
 *    Only generated for tokens that have a dark override:
 *    `--np--background-color--base--light: hsla(0, 100%, 100%, 1);`
 *
 * 3. **Dark primitives** — stable references to dark values, never reassigned by media queries:
 *    `--np--background-color--base--dark: hsla(0, 0%, 27%, 1);`
 *
 * 4. **Dark media query** — reassigns semantic variables to dark primitives when OS is dark:
 *    `@media (prefers-color-scheme: dark) { :root { --np--background-color--base: var(--np--background-color--base--dark); } }`
 *
 * ## Usage in components
 *
 * - Semantic (auto-switches): `getToken("backgroundColor").var` → `var(--np--background-color--base)`
 * - Force light: `getToken("backgroundColor", "base", "light").var` → `var(--np--background-color--base--light)`
 * - Force dark: `getToken("backgroundColor", "base", "dark").var` → `var(--np--background-color--base--dark)`
 *
 * ## Validation
 * - Every token group and variant in tokens.dark.json must exist in tokens.json (build error if not)
 *
 * @module generate-css
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { getConstant } from '../src/services/getCssConstant.js'
import { camelToKebab } from '../src/services/camelToKebab.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Flat token format: { tokenName: { variant: value } } */
interface Tokens {
  [key: string]: Record<string, string>
}

/** Dark overrides: sparse subset of Tokens, validated against default */
interface DarkTokens {
  [tokenName: string]: Record<string, string>
}

/** Error message templates with {placeholder} syntax */
interface Errors {
  [key: string]: string
}

/**
 * Replaces {placeholder} patterns in an error template with provided values.
 *
 * @param errors - Error template map from errors.json
 * @param key - Error key to look up
 * @param values - Placeholder replacements
 * @returns Formatted error message
 */
function formatError(errors: Errors, key: string, values: Record<string, string>): string {
  let message = errors[key] || `Unknown error: ${key}`
  for (const [placeholder, value] of Object.entries(values)) {
    message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value)
  }
  return message
}

/**
 * Validates that every token group and variant in darkTokens exists in defaultTokens.
 * Throws with a descriptive error if a dark token references a nonexistent default.
 *
 * @param defaultTokens - Complete token definitions from tokens.json
 * @param darkTokens - Sparse dark overrides from tokens.dark.json
 * @param errors - Error templates for formatting messages
 * @throws Error if a dark token group or variant is not found in defaults
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
      if (!defaultTokens[tokenName][variantName]) {
        throw new Error(
          formatError(errors, "darkTokenVariantNotFound", {
            tokenName,
            variantName,
            available: Object.keys(defaultTokens[tokenName]).join(', ')
          })
        )
      }
    }
  }
}

/**
 * Generates CSS lines for a single token group, including mode primitives.
 *
 * For each variant in the token group:
 * - Always emits the semantic variable: `--np--{cssName}--{variant}: {value};`
 * - If a dark override exists, also emits:
 *   - Light primitive: `--np--{cssName}--{variant}--light: {value};`
 *   - Dark primitive: `--np--{cssName}--{variant}--dark: {darkValue};`
 *   - Media query reassignment: `--np--{cssName}--{variant}: var(--np--{cssName}--{variant}--dark);`
 *
 * @param cssName - Kebab-case token group name (e.g., "background-color")
 * @param variants - Default variant → value map
 * @param darkVariants - Dark override variant → value map (may be empty)
 * @returns Object with four arrays of CSS declaration strings
 */
function generateTokenGroupCss(
  cssName: string,
  variants: Record<string, string>,
  darkVariants: Record<string, string>
): {
  semanticLines: string[]
  lightPrimitives: string[]
  darkPrimitives: string[]
  darkMediaBody: string[]
} {
  const semanticLines: string[] = []
  const lightPrimitives: string[] = []
  const darkPrimitives: string[] = []
  const darkMediaBody: string[] = []

  for (const [variantName, value] of Object.entries(variants)) {
    // Semantic variable — the one components reference, reassigned by media query in dark mode
    const cssVar = getConstant(cssName, variantName)
    semanticLines.push(`\t${cssVar.key}: ${value};`)

    if (darkVariants[variantName]) {
      // Light primitive — always resolves to the light value, never reassigned
      const lightCssVar = getConstant(cssName, variantName, { mode: "light" })
      lightPrimitives.push(`\t${lightCssVar.key}: ${value};`)

      // Dark primitive — always resolves to the dark value, never reassigned
      const darkCssVar = getConstant(cssName, variantName, { mode: "dark" })
      darkPrimitives.push(`\t${darkCssVar.key}: ${darkVariants[variantName]};`)

      // Media query entry — reassigns the semantic variable to the dark primitive
      darkMediaBody.push(`\t\t${cssVar.key}: var(${darkCssVar.key});`)
    }
  }

  return { semanticLines, lightPrimitives, darkPrimitives, darkMediaBody }
}

/**
 * Builds the combined dist/variables.css containing all token groups.
 *
 * Structure:
 * ```css
 * :root {
 *   color-scheme: light dark;
 *   --np--{group}--{variant}: {value};        // semantic variables
 *   --np--{group}--{variant}--light: {value};  // light primitives
 *   --np--{group}--{variant}--dark: {value};   // dark primitives
 * }
 * @media (prefers-color-scheme: dark) {
 *   :root {
 *     --np--{group}--{variant}: var(--np--{group}--{variant}--dark);
 *   }
 * }
 * [data-theme="light"] { color-scheme: light; }
 * [data-theme="dark"] { color-scheme: dark; }
 * ```
 *
 * @param tokens - Complete default token definitions
 * @param darkTokens - Sparse dark overrides
 * @returns Full CSS file content as a string
 */
function buildCombinedCss(tokens: Tokens, darkTokens: DarkTokens): string {
  const cssLines: string[] = []
  const allLightPrimitives: string[] = []
  const allDarkPrimitives: string[] = []
  const allDarkMediaBody: string[] = []

  cssLines.push(':root {')
  cssLines.push('\tcolor-scheme: light dark;')
  cssLines.push('')

  const tokenNames = Object.keys(tokens)

  for (let i = 0; i < tokenNames.length; i++) {
    const tokenName = tokenNames[i]
    const cssName = camelToKebab(tokenName)
    const darkVariants = darkTokens[tokenName] || {}

    const { semanticLines, lightPrimitives, darkPrimitives, darkMediaBody } =
      generateTokenGroupCss(cssName, tokens[tokenName], darkVariants)

    cssLines.push(...semanticLines)
    allLightPrimitives.push(...lightPrimitives)
    allDarkPrimitives.push(...darkPrimitives)
    allDarkMediaBody.push(...darkMediaBody)

    // Blank line between token groups (except after the last one)
    if (i < tokenNames.length - 1) {
      cssLines.push('')
    }
  }

  // Light mode primitives — stable references that are never reassigned
  if (allLightPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Light mode primitives */')
    cssLines.push(...allLightPrimitives)
  }

  // Dark mode primitives — stable references that are never reassigned
  if (allDarkPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Dark mode primitives */')
    cssLines.push(...allDarkPrimitives)
  }

  cssLines.push('}')

  // Media query — reassigns semantic variables to dark primitives when OS prefers dark
  if (allDarkMediaBody.length > 0) {
    cssLines.push('')
    cssLines.push('@media (prefers-color-scheme: dark) {')
    cssLines.push('\t:root {')
    cssLines.push(...allDarkMediaBody)
    cssLines.push('\t}')
    cssLines.push('}')
    cssLines.push('')
    // data-theme attributes allow explicit override of the browser color scheme
    cssLines.push('[data-theme="light"] { color-scheme: light; }')
    cssLines.push('[data-theme="dark"] { color-scheme: dark; }')
  }

  return cssLines.join('\n')
}

/**
 * Builds a single-group CSS file for dist/css/{tokenName}.css.
 * Same structure as the combined file but scoped to one token group.
 *
 * @param cssName - Kebab-case token group name
 * @param variants - Default variant → value map
 * @param darkVariants - Dark override variant → value map
 * @returns CSS file content as a string
 */
function buildIndividualCss(
  cssName: string,
  variants: Record<string, string>,
  darkVariants: Record<string, string>
): string {
  const { semanticLines, lightPrimitives, darkPrimitives, darkMediaBody } =
    generateTokenGroupCss(cssName, variants, darkVariants)

  const lines: string[] = []
  lines.push(':root {')
  lines.push(...semanticLines)

  if (lightPrimitives.length > 0) {
    lines.push('')
    lines.push('\t/* Light mode primitives */')
    lines.push(...lightPrimitives)
  }

  if (darkPrimitives.length > 0) {
    lines.push('')
    lines.push('\t/* Dark mode primitives */')
    lines.push(...darkPrimitives)
  }

  lines.push('}')

  if (darkMediaBody.length > 0) {
    lines.push('')
    lines.push('@media (prefers-color-scheme: dark) {')
    lines.push('\t:root {')
    lines.push(...darkMediaBody)
    lines.push('\t}')
    lines.push('}')
  }

  return lines.join('\n')
}

/**
 * Main execution: reads source files, validates, generates CSS, writes output.
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

  // Read and validate dark tokens
  let darkTokens: DarkTokens = {}
  if (fs.existsSync(darkTokensPath)) {
    darkTokens = JSON.parse(fs.readFileSync(darkTokensPath, 'utf-8'))
    validateDarkTokens(tokens, darkTokens, errors)
    console.log('✓ Dark tokens validated')
  }

  // Ensure output directories exist
  const distDir = path.join(__dirname, '..', 'dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true })
  }

  // Generate combined variables.css
  fs.writeFileSync(cssPath, buildCombinedCss(tokens, darkTokens), 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

  // Generate individual per-token CSS files
  const tokenNames = Object.keys(tokens)
  for (const tokenName of tokenNames) {
    const cssName = camelToKebab(tokenName)
    const darkVariants = darkTokens[tokenName] || {}
    const css = buildIndividualCss(cssName, tokens[tokenName], darkVariants)
    fs.writeFileSync(path.join(cssDir, `${tokenName}.css`), css, 'utf-8')
  }

  console.log(`✓ Generated: ${tokenNames.length} files in ${cssDir}`)
}

main()