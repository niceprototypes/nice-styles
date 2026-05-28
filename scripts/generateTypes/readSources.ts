/**
 * Token JSON source reader for the type-generation pipeline.
 *
 * Returns the merged variant map driving core type unions, plus the list of
 * component prefixes for the ComponentPrefix union.
 *
 * `module.json` is the comprehensive base (static + day-content); themed groups
 * are split out by checking which group names appear in any alt theme listed in
 * `module.themes.json`. See `scripts/generateTokens/readSources.ts` for the
 * shared rationale.
 */

import * as fs from 'fs'
import * as path from 'path'
import { BREAKPOINT_PHONE } from '../../src/constants/breakpoints.js'

export type TokenMap = Record<string, Record<string, string>>
export type DimensionMap = Record<string, TokenMap>

export interface TypeSources {
  /** Merged map: core + color.day + size.phone. Each entry is one type union. */
  tokens: TokenMap
  /** Component prefixes from component.json day branch — drives ComponentPrefix union. */
  componentPrefixes: string[]
}

/**
 * Parse a JSON file into the requested type.
 */
function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Read base + alt-themes data and reconstitute the legacy `{core, themesDay}`
 * split. Themed groups are split out of the merged base file by checking which
 * group names appear in any alt theme.
 */
function readModule(tokensDir: string): { core: TokenMap; themesDay: TokenMap; breakpoints: DimensionMap } {
  const moduleJson = readJson<TokenMap & { $themes?: DimensionMap; $breakpoints?: DimensionMap }>(
    path.join(tokensDir, 'module.json')
  )
  // Alt themes and breakpoint overrides live under reserved `$themes` and
  // `$breakpoints` keys. Everything else at the top level is base.
  const { $themes: themes = {}, $breakpoints: embeddedBreakpoints, ...base } = moduleJson
  const themedGroups = new Set<string>(Object.values(themes).flatMap((t) => Object.keys(t)))
  const core: TokenMap = {}
  const themesDay: TokenMap = {}
  for (const [group, variants] of Object.entries(base)) {
    if (themedGroups.has(group)) themesDay[group] = variants
    else core[group] = variants
  }
  return { core, themesDay, breakpoints: embeddedBreakpoints ?? {} }
}

/**
 * Read the list of component prefixes from filename stems of `*.component.json`.
 */
function readComponentPrefixes(tokensDir: string): string[] {
  const componentsDir = path.join(tokensDir, 'components')
  const baseFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.json')).sort()
  return baseFiles.map((f) => f.replace(/\.json$/, ''))
}

/**
 * Read every token source needed to produce the type unions.
 *
 * Merge order: core → color day → size phone. Later keys win on collision —
 * phone-first sizing means the phone dimension carries the canonical variant
 * names for breakpoint tokens.
 */
export function readTypeSources(tokensDir: string): TypeSources {
  const { core, themesDay, breakpoints } = readModule(tokensDir)

  // Phone dimension provides the canonical variant names for breakpoint tokens
  const breakpointsPhone = breakpoints[BREAKPOINT_PHONE] || {}

  const tokens: TokenMap = { ...core, ...themesDay, ...breakpointsPhone }
  const componentPrefixes = readComponentPrefixes(tokensDir)

  return { tokens, componentPrefixes }
}
