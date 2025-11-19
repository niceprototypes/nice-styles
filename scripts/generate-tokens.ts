/**
 * Token Generator
 *
 * This script parses constants.ts and automatically generates:
 * 1. tokens.ts with all token exports
 * 2. variables.css with all CSS custom properties
 * 3. Individual CSS files per token in dist/css/
 *
 * It reads the "Token: NAME" comments in constants.ts to understand token boundaries
 * and generates camelCase token names with kebab-case CSS variable names.
 *
 * Example:
 *   Input (constants.ts):
 *     // Token: ANIMATION_DURATION
 *     export const ANIMATION_DURATION_BASE = "300ms"
 *     export const ANIMATION_DURATION_SLOW = "600ms"
 *
 *   Output (tokens.ts):
 *     export const animationDuration = {
 *       base: ANIMATION_DURATION_BASE,
 *       slow: ANIMATION_DURATION_SLOW,
 *     }
 *
 *   Output (animationDuration.css):
 *     :root {
 *       --animation-duration-base: "300ms";
 *       --animation-duration-slow: "600ms";
 *     }
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Represents a single constant entry within a token
 */
interface TokenEntry {
  /** The original constant name from constants.ts (e.g., "ANIMATION_DURATION_BASE") */
  constantName: string
  /** The raw value of the constant (e.g., "300ms") */
  value: string
  /** The camelCase key for the token object (e.g., "base") */
  key: string
}

/**
 * Represents a complete design token with all its entries
 */
interface Token {
  /** The camelCase token name used in TypeScript (e.g., "animationDuration") */
  name: string
  /** The kebab-case prefix used in CSS variables (e.g., "animation-duration") */
  cssPrefix: string
  /** All constant entries belonging to this token */
  entries: TokenEntry[]
}

/**
 * Convert SCREAMING_SNAKE_CASE to camelCase
 *
 * @param str - The string in SCREAMING_SNAKE_CASE format
 * @returns The string converted to camelCase
 *
 * @example
 * toCamelCase("ANIMATION_DURATION") // "animationDuration"
 * toCamelCase("BORDER_RADIUS") // "borderRadius"
 */
function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split('_')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Convert SCREAMING_SNAKE_CASE to kebab-case
 *
 * @param str - The string in SCREAMING_SNAKE_CASE format
 * @returns The string converted to kebab-case
 *
 * @example
 * toKebabCase("ANIMATION_DURATION") // "animation-duration"
 * toKebabCase("BORDER_RADIUS") // "border-radius"
 */
function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/_/g, '-')
}

/**
 * Parse constants.ts file and extract tokens based on "// Token: NAME" comments
 *
 * This function reads the constants.ts file line by line, looking for token
 * boundary markers (// Token: NAME) and the constants that follow them.
 * It groups constants by their token and extracts relevant metadata.
 *
 * @param filePath - Absolute path to the constants.ts file
 * @returns Array of Token objects with their entries
 *
 * @example
 * // Given constants.ts:
 * // // Token: ANIMATION_DURATION
 * // export const ANIMATION_DURATION_BASE = "300ms"
 * // export const ANIMATION_DURATION_SLOW = "600ms"
 * //
 * // Returns:
 * [
 *   {
 *     name: "animationDuration",
 *     cssPrefix: "animation-duration",
 *     entries: [
 *       { constantName: "ANIMATION_DURATION_BASE", value: "300ms", key: "base" },
 *       { constantName: "ANIMATION_DURATION_SLOW", value: "600ms", key: "slow" }
 *     ]
 *   }
 * ]
 */
function parseConstants(filePath: string): Token[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const tokens: Token[] = []
  let currentToken: Token | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check for inline Token comment: // Token: NAME
    const tokenMatch = line.match(/^\/\/\s*Token:\s*(.+)$/)
    if (tokenMatch) {
      const tokenPrefix = tokenMatch[1].trim()
      currentToken = {
        name: toCamelCase(tokenPrefix),
        cssPrefix: toKebabCase(tokenPrefix),
        entries: []
      }
      tokens.push(currentToken)
      continue
    }

    // Check for export const declarations
    const exportMatch = line.match(/^export\s+const\s+([A-Z_]+)\s*=\s*(.+)$/)
    if (exportMatch && currentToken) {
      const constantName = exportMatch[1]
      let value = exportMatch[2]

      // Remove trailing comment and semicolon to get clean value
      value = value.replace(/\s*\/\/.*$/, '').replace(/;$/, '').trim()

      // Extract the key by removing the token prefix from the constant name
      const tokenPrefix = currentToken.cssPrefix.toUpperCase().replace(/-/g, '_')
      let key = constantName

      // Remove the token prefix to get the key portion
      // e.g., "ANIMATION_DURATION_BASE" -> "BASE"
      if (constantName.startsWith(tokenPrefix + '_')) {
        key = constantName.substring(tokenPrefix.length + 1)
      }

      // Convert key to camelCase
      // e.g., "BASE" -> "base", "DOWN_LARGE" -> "downLarge"
      key = toCamelCase(key)

      currentToken.entries.push({
        constantName,
        value,
        key
      })
    }
  }

  return tokens
}

/**
 * Generate tokens.js file content from parsed tokens
 *
 * Creates JavaScript exports for each token category with all token entries.
 * This generates the final output directly, bypassing TypeScript compilation.
 *
 * @param tokens - Array of parsed Token objects
 * @returns Complete JavaScript file content as a string
 *
 * @example
 * // Given tokens array, generates:
 * import * as constants from './constants.js'
 *
 * // AnimationDuration
 * export const animationDuration = {
 *   base: constants.ANIMATION_DURATION_BASE,
 *   slow: constants.ANIMATION_DURATION_SLOW,
 * }
 */
function generateTokensJSFile(tokens: Token[]): string {
  const lines: string[] = []

  // Add imports
  lines.push(`import * as constants from './constants.js'`)
  lines.push(``)

  // Generate each token export
  for (const token of tokens) {
    // Add comment with capitalized token name
    lines.push(`// ${token.name.charAt(0).toUpperCase() + token.name.slice(1)}`)
    lines.push(`export const ${token.name} = {`)

    // Add each entry as a key-value pair
    for (const entry of token.entries) {
      lines.push(`  ${entry.key}: constants.${entry.constantName},`)
    }

    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}

/**
 * Generate tokens.d.ts TypeScript declaration file
 *
 * Creates TypeScript type definitions for all token exports.
 *
 * @param tokens - Array of parsed Token objects
 * @returns Complete TypeScript declaration file content as a string
 */
function generateTokensDTSFile(tokens: Token[]): string {
  const lines: string[] = []

  // Add imports
  lines.push(`import { StyleNamedTokenProps } from './types.js'`)
  lines.push(``)

  // Generate each token declaration
  for (const token of tokens) {
    lines.push(`export declare const ${token.name}: StyleNamedTokenProps`)
  }

  lines.push(``)

  return lines.join('\n')
}

/**
 * Convert camelCase to kebab-case
 *
 * This is specifically for converting camelCase keys to kebab-case
 * CSS variable names.
 *
 * @param str - The string in camelCase format
 * @returns The string converted to kebab-case
 *
 * @example
 * camelToKebab("downLarge") // "down-large"
 * camelToKebab("base") // "base"
 */
function camelToKebab(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * Generate CSS file content with all tokens combined
 *
 * Creates a single CSS file with :root selector containing all
 * CSS custom properties from all tokens. Tokens are separated
 * by blank lines for readability.
 *
 * @param tokens - Array of parsed Token objects
 * @returns Complete CSS file content as a string
 *
 * @example
 * // Generates:
 * :root {
 *   --animation-duration-base: "300ms";
 *   --animation-duration-slow: "600ms";
 *
 *   --border-radius-small: "4px";
 *   --border-radius-base: "8px";
 * }
 */
function generateCSSFile(tokens: Token[]): string {
  const lines: string[] = []

  lines.push(`:root {`)

  for (const token of tokens) {
    for (const entry of token.entries) {
      // Remove quotes from value for CSS output and unescape inner quotes
      const cssValue = entry.value.replace(/^["']|["']$/g, '').replace(/\\"/g, '"').replace(/\\'/g, "'")
      // Generate CSS variable: --prefix-key: value;
      lines.push(`\t--${token.cssPrefix}-${camelToKebab(entry.key)}: ${cssValue};`)
    }

    // Add blank line between tokens (except after the last one)
    if (token !== tokens[tokens.length - 1]) {
      lines.push(``)
    }
  }

  lines.push(`}`)

  return lines.join('\n')
}

/**
 * Generate tokens.ts source file for TypeScript compilation
 *
 * Creates TypeScript source code that will be compiled by tsc.
 * This is a minimal wrapper that re-exports constants as tokens.
 *
 * @param tokens - Array of parsed Token objects
 * @returns Complete TypeScript file content as a string
 */
function generateTokensTSFile(tokens: Token[]): string {
  const lines: string[] = []

  // Add imports
  lines.push(`import * as constants from './constants.js'`)
  lines.push(``)

  // Generate each token export
  for (const token of tokens) {
    // Add comment with capitalized token name
    lines.push(`// ${token.name.charAt(0).toUpperCase() + token.name.slice(1)}`)
    lines.push(`export const ${token.name} = {`)

    // Add each entry as a key-value pair
    for (const entry of token.entries) {
      lines.push(`  ${entry.key}: constants.${entry.constantName},`)
    }

    lines.push(`}`)
    lines.push(``)
  }

  return lines.join('\n')
}

/**
 * Main execution function
 *
 * Orchestrates the entire token generation process:
 * 1. Parses constants.ts to extract token definitions
 * 2. Generates src/tokens.ts (gets compiled by tsc to dist/)
 * 3. Generates variables.css with all CSS custom properties
 * 4. Generates individual CSS files per token in dist/css/
 *
 * All file paths are relative to the script's directory.
 */
function main() {
  // Define file paths
  const constantsPath = path.join(__dirname, '..', 'src', 'constants.ts')
  const tokensTSPath = path.join(__dirname, '..', 'src', 'tokens.ts')
  const cssPath = path.join(__dirname, '..', 'dist', 'variables.css')
  const cssDir = path.join(__dirname, '..', 'dist', 'css')

  // Parse constants.ts to extract all token definitions
  const tokens = parseConstants(constantsPath)

  // Generate src/tokens.ts (will be compiled by tsc)
  const tokensTSContent = generateTokensTSFile(tokens)
  fs.writeFileSync(tokensTSPath, tokensTSContent, 'utf-8')
  console.log(`✓ Generated TypeScript source: ${tokensTSPath}`)

  // Generate combined CSS file with all tokens
  const cssContent = generateCSSFile(tokens)
  fs.writeFileSync(cssPath, cssContent, 'utf-8')
  console.log(`✓ Generated CSS file: ${cssPath}`)

  // Generate individual CSS files per token
  // Ensure the output directory exists
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true })
  }

  // Create a separate CSS file for each token
  for (const token of tokens) {
    const tokenCssLines: string[] = []
    tokenCssLines.push(`:root {`)

    // Add all CSS variables for this token
    for (const entry of token.entries) {
      // Remove quotes from value for CSS output and unescape inner quotes
      const cssValue = entry.value.replace(/^["']|["']$/g, '').replace(/\\"/g, '"').replace(/\\'/g, "'")
      tokenCssLines.push(`\t--${token.cssPrefix}-${camelToKebab(entry.key)}: ${cssValue};`)
    }

    tokenCssLines.push(`}`)

    // Write the individual token CSS file
    const tokenCssPath = path.join(cssDir, `${token.name}.css`)
    fs.writeFileSync(tokenCssPath, tokenCssLines.join('\n'), 'utf-8')
  }

  console.log(`✓ Generated ${tokens.length} individual CSS files in: ${cssDir}`)
}

// Run the main function
main()