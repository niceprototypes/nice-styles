/**
 * Type definition writer.
 *
 * Emits src/generated/types.ts: a union type per token group (semantic
 * defaults, then one `{group}Inverse` union per `$inverse` group), plus
 * `ComponentPrefix` if any component prefixes exist.
 *
 * Called by `scripts/generateTypes/index.ts` (`npm run build:types`), after
 * `build:tokens`. The unions list variant names only; values live in the
 * generated data files and `tokens.css`.
 *
 * @example
 * // output
 * export type GapType = "none" | "smaller" | "small" | "base" | "large" | "larger"
 * export type ColorInverseType = "base" | "light" | …
 * export type ComponentPrefix = "button" | "code" | …
 */

import * as fs from 'fs'
import { generatedHeader } from '../shared/generatedHeader.js'
import { semanticDefaults } from '../shared/semanticDefaults.js'
import type { Tokens, TokenSourceModel } from '../shared/types.js'

/**
 * Convert a camelCase token name into PascalCase for the type identifier.
 * `borderRadius` → `BorderRadius`, used as `BorderRadiusType`.
 *
 * @param str - camelCase group name
 * @returns The name with its first character upper-cased
 */
function camelToPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Build a single union-type line: `export type FontSizeType = "small" | "base" | ...`.
 * Members follow the variant key order of the source JSON.
 *
 * @param tokenName - camelCase group name (e.g. `fontSize`, `colorInverse`)
 * @param variants - The group's variants; only the keys are used
 * @returns One `export type` line
 */
function buildTokenUnionLine(tokenName: string, variants: Record<string, string>): string {
  const items = Object.keys(variants)
  const typeName = `${camelToPascal(tokenName)}Type`
  const unionType = items.map(key => `"${key}"`).join(' | ')
  return `export type ${typeName} = ${unionType}`
}

/**
 * Build the ComponentPrefix union line. Returns null when there are no prefixes
 * (which would produce an invalid `= ` syntax).
 *
 * @param prefixes - Component prefixes, in file order
 * @returns One `export type` line, or null
 */
function buildComponentPrefixLine(prefixes: string[]): string | null {
  if (prefixes.length === 0) return null
  const unionType = prefixes.map(p => `"${p}"`).join(' | ')
  return `export type ComponentPrefix = ${unionType}`
}

/**
 * Assemble the full lines array for the output file.
 *
 * @param tokens - Groups to emit a union for, in output order
 * @param componentPrefixes - Component prefixes for `ComponentPrefix`
 * @returns File lines: header, token unions, blank line, `ComponentPrefix`, trailing blank line
 */
function assembleLines(tokens: Tokens, componentPrefixes: string[]): string[] {
  const lines: string[] = [
    generatedHeader('src/tokens/modules/*.json, src/tokens/components/*.json', ['Regenerate: npm run build:types']),
  ]

  // One union per group
  for (const tokenName of Object.keys(tokens)) {
    lines.push(buildTokenUnionLine(tokenName, tokens[tokenName]))
  }
  lines.push('')

  // Component prefix union, omitted when there are no component files
  const prefixLine = buildComponentPrefixLine(componentPrefixes)
  if (prefixLine !== null) lines.push(prefixLine)
  lines.push('')

  return lines
}

/**
 * Write the assembled types.ts file and emit progress logs.
 *
 * @param model - Validated sources from `readTokenSources`
 * @param outputPath - Absolute path of `src/generated/types.ts`
 */
export function writeTypesFile(model: TokenSourceModel, outputPath: string): void {
  // `{group}Inverse` groups produce ColorInverseType / BackgroundColorInverseType
  const inverseGroups = Object.fromEntries(Object.entries(model.inverse.day).map(([group, variants]) => [`${group}Inverse`, variants]))
  // Semantic defaults give each group its full variant set (themed day values,
  // phone values for breakpoint-only groups); inverse unions follow
  const tokens: Tokens = { ...semanticDefaults(model), ...inverseGroups }
  // Prefixes in file order — readTokenSources sorts the component files
  const componentPrefixes = Object.keys(model.components.base)

  const lines = assembleLines(tokens, componentPrefixes)
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8')

  console.log(`✓ Generated TypeScript types: ${outputPath}`)
  console.log(`✓ Generated ${Object.keys(tokens).length} core type definitions`)
  if (componentPrefixes.length > 0) {
    console.log(`✓ Generated ComponentPrefix: ${componentPrefixes.join(', ')}`)
  }
}
