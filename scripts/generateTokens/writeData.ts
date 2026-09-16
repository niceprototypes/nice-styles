/**
 * Token data writer — `src/generated/*.ts`.
 *
 * Emits seven typed TypeScript modules the runtime imports (registry seeding,
 * `getToken`, `applyBreakpoints`, `BREAKPOINTS`). Each writer is one call to
 * `writeDataModule`, so the orchestrator reads as a flat list of named writes.
 *
 * Called by `scripts/generateTokens/index.ts` (`npm run build:tokens`), the
 * first build stage: `src/constants/` and the registry import these files, so
 * every later stage depends on them.
 *
 * ## Output
 *
 * | File | Source | Contents |
 * |------|--------|----------|
 * | `tokensData.ts` | `src/tokens/modules/*.json` | Unthemed base groups |
 * | `themeTokensData.ts` | `src/tokens/modules/*.json` | Themed groups keyed by theme (`day` = base, others from `$themes`) |
 * | `breakpointTokensData.ts` | `src/tokens/modules/*.json` | `$breakpoints`, keyed by breakpoint |
 * | `inverseTokensData.ts` | `src/tokens/modules/*.json` | `$inverse`, keyed group → day/night |
 * | `componentTokensData.ts` | `src/tokens/components/*.json` | Base trees keyed by prefix (`$` axes stripped) |
 * | `componentBreakpointTokensData.ts` | `src/tokens/components/*.json` | `$breakpoints` partial trees, keyed prefix → breakpoint |
 * | `breakpointsData.ts` | `src/tokens/breakpoints.json` | Pixel thresholds |
 */

import * as fs from 'fs'
import * as path from 'path'
import { generatedHeader } from '../shared/generatedHeader.js'
import type {
  ComponentBreakpointTokens,
  ComponentTokens,
  DimensionTokens,
  Tokens,
  TokenSourceModel,
} from '../shared/types.js'

/** Inverse values per group, keyed group → day/night → variant. */
type InverseData = Record<string, { day: Tokens[string]; night: Tokens[string] }>

/** Header source label for data read from the module folder. */
const MODULES_SOURCE = 'src/tokens/modules/*.json'

/**
 * Write a TypeScript module exporting one typed constant: header, type
 * definitions, the constant, and a default export.
 *
 * @param outputPath - Absolute path of the `.ts` file
 * @param source - Header source label (see `generatedHeader`)
 * @param typeDefs - Type declarations emitted above the constant
 * @param varName - Constant name, also the default export
 * @param varType - Type annotation of the constant
 * @param data - JSON-serializable value
 */
function writeDataModule(
  outputPath: string,
  source: string,
  typeDefs: string,
  varName: string,
  varType: string,
  data: unknown
): void {
  // Header, type definitions, the typed constant (JSON with 2-space indent), default export
  const lines: string[] = [
    generatedHeader(source, ['Regenerate: npm run build:tokens']),
    typeDefs,
    ``,
    `const ${varName}: ${varType} = ${JSON.stringify(data, null, 2)} as const`,
    ``,
    `export default ${varName}`,
  ]

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8')
  console.log(`✓ Generated: ${outputPath}`)
}

/**
 * `tokensData.ts` — unthemed base groups.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - `model.core`
 */
function writeCoreTokens(generatedDir: string, data: Tokens): void {
  writeDataModule(
    path.join(generatedDir, 'tokensData.ts'),
    MODULES_SOURCE,
    `export type TokenDefinition = Record<string, string>\n\nexport type TokensData = Record<string, TokenDefinition>`,
    'tokensData',
    'TokensData',
    data
  )
}

/**
 * `themeTokensData.ts` — themed groups keyed by theme.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - `{ day, night }` groups
 */
function writeThemeTokens(generatedDir: string, data: DimensionTokens): void {
  writeDataModule(
    path.join(generatedDir, 'themeTokensData.ts'),
    `${MODULES_SOURCE} ($themes)`,
    `export type TokenDefinition = Record<string, string>\n\nexport type ThemeTokensData = Record<string, Record<string, TokenDefinition>>`,
    'themeTokensData',
    'ThemeTokensData',
    data
  )
}

/**
 * `breakpointTokensData.ts` — breakpoint values keyed by breakpoint.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - `model.breakpointTokens`
 */
function writeBreakpointTokens(generatedDir: string, data: DimensionTokens): void {
  writeDataModule(
    path.join(generatedDir, 'breakpointTokensData.ts'),
    `${MODULES_SOURCE} ($breakpoints)`,
    `export type TokenDefinition = Record<string, string>\n\nexport type BreakpointTokensData = Record<string, Record<string, TokenDefinition>>`,
    'breakpointTokensData',
    'BreakpointTokensData',
    data
  )
}

/**
 * `componentTokensData.ts` — component base trees keyed by prefix.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - `model.components.base`
 */
function writeComponentTokens(generatedDir: string, data: ComponentTokens): void {
  writeDataModule(
    path.join(generatedDir, 'componentTokensData.ts'),
    'src/tokens/components/*.json',
    `export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }\n\nexport type ComponentTokensData = Record<string, { [key: string]: ComponentTokenNode }>`,
    'componentTokensData',
    'ComponentTokensData',
    data
  )
}

/**
 * `componentBreakpointTokensData.ts` — component `$breakpoints` partial trees. Read by `applyBreakpoints`.
 * Its type imports `ComponentTokenNode` from `componentTokensData.ts` instead of redeclaring it.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - `model.components.breakpoints`
 */
function writeComponentBreakpointTokens(generatedDir: string, data: ComponentBreakpointTokens): void {
  writeDataModule(
    path.join(generatedDir, 'componentBreakpointTokensData.ts'),
    'src/tokens/components/*.json ($breakpoints)',
    `import type { ComponentTokenNode } from './componentTokensData.js'\n\nexport type ComponentBreakpointTokensData = Record<string, Record<string, { [key: string]: ComponentTokenNode }>>`,
    'componentBreakpointTokensData',
    'ComponentBreakpointTokensData',
    data
  )
}

/**
 * `breakpointsData.ts` — pixel thresholds keyed by breakpoint. Read by `src/constants/breakpoints.ts`.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - `model.thresholds`
 */
function writeBreakpoints(generatedDir: string, data: TokenSourceModel['thresholds']): void {
  writeDataModule(
    path.join(generatedDir, 'breakpointsData.ts'),
    'src/tokens/breakpoints.json',
    `export type BreakpointsData = Record<string, number>`,
    'breakpointsData',
    'BreakpointsData',
    data
  )
}

/**
 * `inverseTokensData.ts` — inverse values keyed group → day/night → variant.
 * Seeded into the registry, where `getToken({ inverse: true })` reads it.
 *
 * @param generatedDir - Absolute path to `src/generated/`
 * @param data - Inverse values regrouped per group
 */
function writeInverseTokens(generatedDir: string, data: InverseData): void {
  writeDataModule(
    path.join(generatedDir, 'inverseTokensData.ts'),
    `${MODULES_SOURCE} ($inverse)`,
    `export type TokenDefinition = Record<string, string>\n\nexport type InverseTokensData = Record<string, { day: TokenDefinition; night: TokenDefinition }>`,
    'inverseTokensData',
    'InverseTokensData',
    data
  )
}

/**
 * @param model - Validated sources from `readTokenSources`
 * @param generatedDir - Absolute path to `src/generated/`
 */
export function writeTokenDataFiles(model: TokenSourceModel, generatedDir: string): void {
  // Inverse ships regrouped per group: { day, night }
  const inverse: InverseData = Object.fromEntries(
    Object.keys(model.inverse.day).map((group) => [group, { day: model.inverse.day[group], night: model.inverse.night[group] }])
  )

  // Extra themes are not shipped as data — only day and night reach the runtime
  writeCoreTokens(generatedDir, model.core)
  writeThemeTokens(generatedDir, { day: model.themes.day, night: model.themes.night })
  writeBreakpointTokens(generatedDir, model.breakpointTokens)
  writeComponentTokens(generatedDir, model.components.base)
  writeComponentBreakpointTokens(generatedDir, model.components.breakpoints)
  writeBreakpoints(generatedDir, model.thresholds)
  writeInverseTokens(generatedDir, inverse)
}
