/**
 * Token JSON source reader for the data-generation pipeline.
 *
 * Loads the four token source files used by writeData. No merging is done here —
 * downstream writers each emit their own dedicated dist file, so source data is
 * passed through unchanged.
 */

import * as fs from 'fs'
import * as path from 'path'

export type TokenMap = Record<string, Record<string, string>>
export type DimensionMap = Record<string, TokenMap>
export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }
export type ComponentTokensJson = Record<string, { [key: string]: ComponentTokenNode }>
export type BreakpointsJson = Record<string, number>

export interface TokenJsonSources {
  /** module.json — flat core tokens */
  core: TokenMap
  /** module.modes.json — keyed by mode (day/night) */
  color: DimensionMap
  /** module.breakpoints.json — keyed by breakpoint */
  size: DimensionMap
  /** component.json day branch — keyed by component prefix */
  component: ComponentTokensJson
  /** breakpoints.json — pixel thresholds keyed by breakpoint name */
  breakpoints: BreakpointsJson
}

/**
 * Parse a JSON file into the requested type. Single read site so call sites
 * stay tidy.
 */
function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Read every token JSON source from tokensDir.
 */
export function readTokenJsonSources(tokensDir: string): TokenJsonSources {
  const core = readJson<TokenMap>(path.join(tokensDir, 'module.json'))
  const color = readJson<DimensionMap>(path.join(tokensDir, 'module.modes.json'))
  const size = readJson<DimensionMap>(path.join(tokensDir, 'module.breakpoints.json'))
  // component.json wraps day/night; the data writer only emits day
  const componentJson = readJson<{ day: ComponentTokensJson; night?: ComponentTokensJson }>(
    path.join(tokensDir, 'component.json')
  )
  const breakpoints = readJson<BreakpointsJson>(path.join(tokensDir, 'breakpoints.json'))
  return { core, color, size, component: componentJson.day, breakpoints }
}
