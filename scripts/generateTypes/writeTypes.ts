/**
 * Type definition writer.
 *
 * Emits src/generated/types.ts: a union type per token group (semantic
 * defaults, then one `{group}Inverse` union per `$inverse` group),
 * `ComponentPrefix` if any component prefixes exist, and the address types
 * that type `getToken`: `TokenVariants` (address group → variant union, core
 * and component), `TokenInverseVariants` (groups with an `:inverse` effect),
 * `TokenGroup`, and `TokenAddress` (every valid address string).
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
 * export interface TokenVariants { "gap": GapType; "button.icon.size": "smaller" | … }
 * export type TokenAddress = "gap" | "gap:none" | … | "button.icon.size:small" | … | "color:base:inverse" | …
 */

import * as fs from 'fs'
import { generatedHeader } from '../shared/generatedHeader.js'
import { semanticDefaults } from '../shared/semanticDefaults.js'
import { walkTokenTree } from '../../src/utilities/css/treeWalk.js'
import { buildCoreInverseMap, extractCoreVar } from '../../src/utilities/css/componentInverseCss.js'
import type { ComponentTokens, Tokens, TokenSourceModel } from '../shared/types.js'

/** Address group (`"fontSize"`, `"button.icon.size"`) → TypeScript type expression of its variant union. */
type GroupTypeMap = Record<string, string>

/** Reserved group seeded from `breakpoints.json` (`getToken("breakpoints:laptop")`); see `src/registry/index.ts`. */
const BREAKPOINTS_GROUP = 'breakpoints'

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
 * Quote each name and join them into a string-literal union.
 *
 * @param names - Variant names
 * @returns `"a" | "b" | …`
 */
function literalUnion(names: string[]): string {
  return names.map((name) => `"${name}"`).join(' | ')
}

/**
 * Component groups keyed by their address group, walked from each base tree.
 * A leaf's parent path is the group and the leaf key is the variant, the same
 * split the registry seeding makes (`src/registry/index.ts`).
 *
 * @param components - Component base trees keyed by prefix
 * @param include - Keeps a leaf when true; receives its value (all leaves when omitted)
 * @returns `{ "prefix.group.sub": ["variant", …] }`, in tree order
 */
function componentGroups(components: ComponentTokens, include: (value: string) => boolean = () => true): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const [prefix, tree] of Object.entries(components)) {
    walkTokenTree(tree, (path, value) => {
      if (!include(value)) return
      const group = [prefix, ...path.slice(0, -1)].join('.')
      ;(groups[group] ??= []).push(path[path.length - 1])
    })
  }
  return groups
}

/**
 * Every address group and its variant union — what `getToken`'s two-argument
 * form and the address form accept.
 *
 * Core groups reference their generated `{Group}Type` union; the reserved
 * `breakpoints` group lists the threshold names; component groups list their
 * leaf keys literally.
 *
 * @param tokens - Semantic defaults (one entry per core group)
 * @param model - Validated sources, for thresholds and component trees
 * @returns `{ group: typeExpression }`
 */
function buildVariantMap(tokens: Tokens, model: TokenSourceModel): GroupTypeMap {
  const map: GroupTypeMap = {}
  for (const group of Object.keys(tokens)) map[group] = `${camelToPascal(group)}Type`
  map[BREAKPOINTS_GROUP] = literalUnion(Object.keys(model.thresholds))
  for (const [group, variants] of Object.entries(componentGroups(model.components.base))) map[group] = literalUnion(variants)
  return map
}

/**
 * Groups that carry the `:inverse` effect. Core groups are the `$inverse`
 * modules; component groups are the bare aliases to a core color with an
 * inverse, which the CSS and the registry derive an `--inverse` variable for
 * (`src/utilities/css/componentInverseCss.ts`).
 *
 * @param model - Validated sources
 * @returns `{ group: typeExpression }`
 */
function buildInverseVariantMap(model: TokenSourceModel): GroupTypeMap {
  const map: GroupTypeMap = {}
  for (const group of Object.keys(model.inverse.day)) map[group] = `${camelToPascal(group)}InverseType`
  // Only an alias the inverse map can follow gets a derived inverse variable
  const coreInverse = buildCoreInverseMap(model.inverse.day, model.inverse.night)
  const hasInverse = (value: string): boolean => {
    const coreVar = extractCoreVar(value)
    return coreVar !== null && coreInverse.has(coreVar)
  }
  for (const [group, variants] of Object.entries(componentGroups(model.components.base, hasInverse))) {
    map[group] = literalUnion(variants)
  }
  return map
}

/**
 * Emit one interface keyed by address group.
 *
 * @param name - Interface name
 * @param doc - JSDoc line for the interface
 * @param map - Group → type expression
 * @returns The interface lines
 */
function buildInterfaceLines(name: string, doc: string, map: GroupTypeMap): string[] {
  return [
    `/** ${doc} */`,
    `export interface ${name} {`,
    ...Object.entries(map).map(([group, type]) => `  "${group}": ${type}`),
    '}',
  ]
}

/**
 * The address types: the two group maps, `TokenGroup`, and `TokenAddress`.
 *
 * `TokenAddress` is derived from the maps rather than listed, so it cannot
 * drift from them. It holds `group:variant` for every group, the bare `group`
 * for groups with a `base` variant (the grammar's unsuffixed default), and
 * `group:variant:inverse` for every inverse group.
 *
 * @param variants - Output of `buildVariantMap`
 * @param inverse - Output of `buildInverseVariantMap`
 * @returns File lines for the address section
 */
function buildAddressLines(variants: GroupTypeMap, inverse: GroupTypeMap): string[] {
  return [
    ...buildInterfaceLines('TokenVariants', 'Variant union of every token group, keyed by address group (`"fontSize"`, `"button.icon.size"`).', variants),
    '',
    ...buildInterfaceLines('TokenInverseVariants', 'Variant union of every token group that has the `:inverse` effect.', inverse),
    '',
    '/** Every token group an address or the two-argument `getToken` form can name. */',
    'export type TokenGroup = keyof TokenVariants',
    '',
    '/** Every valid token address: `group:variant`, bare `group` where the group has `base`, and `group:variant:inverse`. */',
    'export type TokenAddress =',
    '  | { [G in TokenGroup]: `${G}:${TokenVariants[G]}` | ("base" extends TokenVariants[G] ? G : never) }[TokenGroup]',
    '  | { [G in keyof TokenInverseVariants]: `${G}:${TokenInverseVariants[G]}:inverse` }[keyof TokenInverseVariants]',
  ]
}

/**
 * Assemble the full lines array for the output file.
 *
 * @param tokens - Groups to emit a union for, in output order
 * @param componentPrefixes - Component prefixes for `ComponentPrefix`
 * @param addressLines - Output of `buildAddressLines`
 * @returns File lines: header, token unions, blank line, `ComponentPrefix`, blank line, address types, trailing blank line
 */
function assembleLines(tokens: Tokens, componentPrefixes: string[], addressLines: string[]): string[] {
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

  // Address types — read by getToken's overloads
  lines.push(...addressLines, '')

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

  // Address maps key core groups by name only — inverse unions are not groups of their own
  const coreTokens = semanticDefaults(model)
  const addressLines = buildAddressLines(buildVariantMap(coreTokens, model), buildInverseVariantMap(model))

  const lines = assembleLines(tokens, componentPrefixes, addressLines)
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8')

  console.log(`✓ Generated TypeScript types: ${outputPath}`)
  console.log(`✓ Generated ${Object.keys(tokens).length} core type definitions`)
  if (componentPrefixes.length > 0) {
    console.log(`✓ Generated ComponentPrefix: ${componentPrefixes.join(', ')}`)
  }
  console.log('✓ Generated TokenVariants, TokenInverseVariants, TokenGroup, TokenAddress')
}
