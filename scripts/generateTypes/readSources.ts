/**
 * Token JSON source reader for the type-generation pipeline.
 *
 * Returns the merged variant map driving core type unions, plus the list of
 * component prefixes for the ComponentPrefix union.
 */

import * as fs from 'fs'
import * as path from 'path'
import { BREAKPOINT_PHONE } from '../../src/constants/breakpoints.js'

export type TokenMap = Record<string, Record<string, string>>

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
 * Read every token source needed to produce the type unions.
 *
 * Merge order: core → color day → size phone. Later keys win on collision —
 * phone-first sizing means the phone dimension carries the canonical variant
 * names for size tokens.
 */
export function readTypeSources(tokensDir: string): TypeSources {
  const core = readJson<TokenMap>(path.join(tokensDir, 'module.json'))

  // Day dimension provides the canonical variant names for color tokens
  const colorJson = readJson<{ day?: TokenMap; night?: TokenMap }>(
    path.join(tokensDir, 'module.modes.json')
  )
  const colorDay = colorJson.day || {}

  // Phone dimension provides the canonical variant names for size tokens
  const sizeJson = readJson<Record<string, TokenMap>>(
    path.join(tokensDir, 'module.breakpoints.json')
  )
  const sizePhone = sizeJson[BREAKPOINT_PHONE] || {}

  const tokens: TokenMap = { ...core, ...colorDay, ...sizePhone }

  // Component prefix list comes from component.json day keys
  const componentJson = readJson<{ day: Record<string, unknown>; night?: Record<string, unknown> }>(
    path.join(tokensDir, 'component.json')
  )
  const componentPrefixes = Object.keys(componentJson.day)

  return { tokens, componentPrefixes }
}
