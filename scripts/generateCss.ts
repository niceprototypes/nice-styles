/**
 * CSS Generator
 *
 * Reads core tokens (default + night overrides) and component tokens,
 * then generates CSS custom properties files.
 *
 * ## Input
 * - src/tokens/core/default/index.json: Default theme in flat format { tokenName: { variant: value } }
 * - src/tokens/core/night/index.json: Night mode overrides (sparse, validated against default)
 * - src/tokens/component/{name}/index.json: Component token definitions
 * - src/errors.json: Error message templates
 *
 * ## Output
 * - dist/variables.css: Combined CSS with all tokens + mode primitives + dark media query
 * - dist/css/*.css: Individual CSS files per token group
 *
 * ## Generated CSS Structure
 *
 * For each core token, the generator produces:
 *
 * 1. **Semantic variables** — the default values, used by components:
 *    `--np--background-color--base: hsla(0, 100%, 100%, 1);`
 *
 * 2. **Light primitives** — stable references to light values, never reassigned by media queries.
 *    Only generated for tokens that have a night override:
 *    `--np--background-color--base--light: hsla(0, 100%, 100%, 1);`
 *
 * 3. **Night primitives** — stable references to night values, never reassigned by media queries:
 *    `--np--background-color--base--night: hsla(0, 0%, 27%, 1);`
 *
 * 4. **Dark media query** — reassigns semantic variables to night primitives when OS is dark:
 *    `@media (prefers-color-scheme: dark) { :root { --np--background-color--base: var(--np--background-color--base--night); } }`
 *
 * For each component token:
 *    `--np--button--size--base: var(--np--cell-height--base);`
 *
 * ## Usage in components
 *
 * - Semantic (auto-switches): `getToken("backgroundColor").var` → `var(--np--background-color--base)`
 * - Force light: `getToken("backgroundColor", "base", "light").var` → `var(--np--background-color--base--light)`
 * - Force night: `getToken("backgroundColor", "base", "night").var` → `var(--np--background-color--base--night)`
 *
 * ## Validation
 * - Every token group and variant in night tokens must exist in default tokens (build error if not)
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

/** Night overrides: sparse subset of Tokens, validated against default */
interface NightTokens {
  [tokenName: string]: Record<string, string>
}

/** Component tokens: { prefix: { tokenName: { variant: value } } } */
interface ComponentTokens {
  [prefix: string]: Tokens
}

/** Error message templates with {placeholder} syntax */
interface Errors {
  [key: string]: string
}

/**
 * Replaces {placeholder} patterns in an error template with provided values.
 */
function formatError(errors: Errors, key: string, values: Record<string, string>): string {
  let message = errors[key] || `Unknown error: ${key}`
  for (const [placeholder, value] of Object.entries(values)) {
    message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value)
  }
  return message
}

/**
 * Validates that every token group and variant in nightTokens exists in defaultTokens.
 * Throws with a descriptive error if a night token references a nonexistent default.
 */
function validateNightTokens(
  defaultTokens: Tokens,
  nightTokens: NightTokens,
  errors: Errors
): void {
  for (const [tokenName, variants] of Object.entries(nightTokens)) {
    if (!defaultTokens[tokenName]) {
      throw new Error(
        formatError(errors, "nightTokenGroupNotFound", {
          tokenName,
          available: Object.keys(defaultTokens).join(', ')
        })
      )
    }

    for (const variantName of Object.keys(variants)) {
      if (!defaultTokens[tokenName][variantName]) {
        throw new Error(
          formatError(errors, "nightTokenVariantNotFound", {
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
 * Generates CSS lines for a single core token group, including mode primitives.
 *
 * For each variant in the token group:
 * - Always emits the semantic variable: `--np--{cssName}--{variant}: {value};`
 * - If a night override exists, also emits:
 *   - Light primitive: `--np--{cssName}--{variant}--light: {value};`
 *   - Night primitive: `--np--{cssName}--{variant}--night: {nightValue};`
 *   - Media query reassignment: `--np--{cssName}--{variant}: var(--np--{cssName}--{variant}--night);`
 */
function generateTokenGroupCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>
): {
  semanticLines: string[]
  lightPrimitives: string[]
  nightPrimitives: string[]
  nightMediaBody: string[]
} {
  const semanticLines: string[] = []
  const lightPrimitives: string[] = []
  const nightPrimitives: string[] = []
  const nightMediaBody: string[] = []

  for (const [variantName, value] of Object.entries(variants)) {
    // Semantic variable — the one components reference, reassigned by media query in dark mode
    const cssVar = getConstant(cssName, variantName)
    semanticLines.push(`\t${cssVar.key}: ${value};`)

    if (nightVariants[variantName]) {
      // Light primitive — always resolves to the light value, never reassigned
      const lightCssVar = getConstant(cssName, variantName, { mode: "light" })
      lightPrimitives.push(`\t${lightCssVar.key}: ${value};`)

      // Night primitive — always resolves to the night value, never reassigned
      const nightCssVar = getConstant(cssName, variantName, { mode: "night" })
      nightPrimitives.push(`\t${nightCssVar.key}: ${nightVariants[variantName]};`)

      // Media query entry — reassigns the semantic variable to the night primitive
      nightMediaBody.push(`\t\t${cssVar.key}: var(${nightCssVar.key});`)
    }
  }

  return { semanticLines, lightPrimitives, nightPrimitives, nightMediaBody }
}

/**
 * Scan src/tokens/component/ for subdirectories containing index.json
 */
function loadComponentTokens(srcDir: string): ComponentTokens {
  const componentDir = path.join(srcDir, 'tokens', 'component')
  const result: ComponentTokens = {}

  if (!fs.existsSync(componentDir)) {
    return result
  }

  const names = fs.readdirSync(componentDir)
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const dirPath = path.join(componentDir, name)
    const stat = fs.statSync(dirPath)
    if (stat.isDirectory()) {
      const jsonPath = path.join(dirPath, 'index.json')
      if (fs.existsSync(jsonPath)) {
        result[name] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      }
    }
  }

  return result
}

/**
 * Generates CSS lines for component tokens.
 * Emits `--np--{prefix}--{token}--{variant}: {value};` for each entry.
 */
function generateComponentTokenCss(componentTokens: ComponentTokens): string[] {
  const lines: string[] = []

  for (const [prefix, tokenMap] of Object.entries(componentTokens)) {
    lines.push('')
    lines.push(`\t/* ${prefix} component tokens */`)

    for (const [tokenName, variants] of Object.entries(tokenMap)) {
      const cssName = camelToKebab(tokenName)
      for (const [variantName, value] of Object.entries(variants)) {
        const cssVar = getConstant(cssName, camelToKebab(variantName), { pkg: prefix })
        lines.push(`\t${cssVar.key}: ${value};`)
      }
    }
  }

  return lines
}

/**
 * Builds the combined dist/variables.css containing all token groups.
 *
 * Structure:
 * ```css
 * :root {
 *   color-scheme: light dark;
 *   --np--{group}--{variant}: {value};         // semantic variables
 *   --np--{group}--{variant}--light: {value};   // light primitives
 *   --np--{group}--{variant}--night: {value};   // night primitives
 *   --np--{prefix}--{token}--{variant}: {value}; // component tokens
 * }
 * @media (prefers-color-scheme: dark) {
 *   :root {
 *     --np--{group}--{variant}: var(--np--{group}--{variant}--night);
 *   }
 * }
 * [data-theme="light"] { color-scheme: light; }
 * [data-theme="dark"] { color-scheme: dark; }
 * ```
 */
function buildCombinedCss(tokens: Tokens, nightTokens: NightTokens, componentTokens: ComponentTokens): string {
  const cssLines: string[] = []
  const allLightPrimitives: string[] = []
  const allNightPrimitives: string[] = []
  const allNightMediaBody: string[] = []

  cssLines.push(':root {')
  cssLines.push('\tcolor-scheme: light dark;')
  cssLines.push('')

  const tokenNames = Object.keys(tokens)

  for (let i = 0; i < tokenNames.length; i++) {
    const tokenName = tokenNames[i]
    const cssName = camelToKebab(tokenName)
    const nightVariants = nightTokens[tokenName] || {}

    const { semanticLines, lightPrimitives, nightPrimitives, nightMediaBody } =
      generateTokenGroupCss(cssName, tokens[tokenName], nightVariants)

    cssLines.push(...semanticLines)
    allLightPrimitives.push(...lightPrimitives)
    allNightPrimitives.push(...nightPrimitives)
    allNightMediaBody.push(...nightMediaBody)

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

  // Night mode primitives — stable references that are never reassigned
  if (allNightPrimitives.length > 0) {
    cssLines.push('')
    cssLines.push('\t/* Night mode primitives */')
    cssLines.push(...allNightPrimitives)
  }

  // Component tokens
  const componentLines = generateComponentTokenCss(componentTokens)
  if (componentLines.length > 0) {
    cssLines.push(...componentLines)
  }

  cssLines.push('}')

  // Media query — reassigns semantic variables to night primitives when OS prefers dark
  if (allNightMediaBody.length > 0) {
    cssLines.push('')
    cssLines.push('@media (prefers-color-scheme: dark) {')
    cssLines.push('\t:root {')
    cssLines.push(...allNightMediaBody)
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
 */
function buildIndividualCss(
  cssName: string,
  variants: Record<string, string>,
  nightVariants: Record<string, string>
): string {
  const { semanticLines, lightPrimitives, nightPrimitives, nightMediaBody } =
    generateTokenGroupCss(cssName, variants, nightVariants)

  const lines: string[] = []
  lines.push(':root {')
  lines.push(...semanticLines)

  if (lightPrimitives.length > 0) {
    lines.push('')
    lines.push('\t/* Light mode primitives */')
    lines.push(...lightPrimitives)
  }

  if (nightPrimitives.length > 0) {
    lines.push('')
    lines.push('\t/* Night mode primitives */')
    lines.push(...nightPrimitives)
  }

  lines.push('}')

  if (nightMediaBody.length > 0) {
    lines.push('')
    lines.push('@media (prefers-color-scheme: dark) {')
    lines.push('\t:root {')
    lines.push(...nightMediaBody)
    lines.push('\t}')
    lines.push('}')
  }

  return lines.join('\n')
}

/**
 * Main execution: reads source files, validates, generates CSS, writes output.
 */
function main() {
  const srcDir = path.join(__dirname, '..', 'src')
  const tokensPath = path.join(srcDir, 'tokens', 'core', 'default', 'index.json')
  const nightTokensPath = path.join(srcDir, 'tokens', 'core', 'night', 'index.json')
  const errorsPath = path.join(srcDir, 'errors.json')
  const cssPath = path.join(__dirname, '..', 'dist', 'variables.css')
  const cssDir = path.join(__dirname, '..', 'dist', 'css')

  // Read source files
  const tokens: Tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))
  const errors: Errors = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'))

  // Read and validate night tokens
  let nightTokens: NightTokens = {}
  if (fs.existsSync(nightTokensPath)) {
    nightTokens = JSON.parse(fs.readFileSync(nightTokensPath, 'utf-8'))
    validateNightTokens(tokens, nightTokens, errors)
    console.log('✓ Night tokens validated')
  }

  // Load component tokens
  const componentTokens = loadComponentTokens(srcDir)
  const componentCount = Object.keys(componentTokens).length
  if (componentCount > 0) {
    console.log(`✓ Loaded ${componentCount} component token sets: ${Object.keys(componentTokens).join(', ')}`)
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
  fs.writeFileSync(cssPath, buildCombinedCss(tokens, nightTokens, componentTokens), 'utf-8')
  console.log(`✓ Generated: ${cssPath}`)

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
