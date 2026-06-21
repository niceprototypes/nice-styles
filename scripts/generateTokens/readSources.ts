/**
 * Token JSON source reader for the data-generation pipeline.
 *
 * Loads the five token source files used by writeData. No merging is done here —
 * downstream writers each emit their own dedicated dist file, so source data is
 * passed through unchanged.
 *
 * **Layout:** `module.json` is the comprehensive base (static tokens + the
 * default-theme values for theme-conditional groups like color, backgroundColor,
 * borderColor). `module.themes.json` is keyed by alternative theme names only
 * (`{night, …}`) — the base is unwrapped at the top of `module.json`, not under
 * a `day` key. The reader reconstitutes the legacy `{core, themesDay,
 * themesNight}` split so downstream emit code stays shape-stable.
 */

import * as fs from 'fs'
import * as path from 'path'
import { readModuleFolder } from '../shared/readModuleFolder.js'

export type TokenMap = Record<string, Record<string, string>>
export type DimensionMap = Record<string, TokenMap>
export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }
export type ComponentTokensJson = Record<string, { [key: string]: ComponentTokenNode }>
export type BreakpointsJson = Record<string, number>
/** Inverse values per group, keyed group → {day, night} → variant → value. */
export type InverseData = Record<string, { day: Record<string, string>; night: Record<string, string> }>

export interface TokenJsonSources {
  /** Static core tokens (no theme variation) */
  core: TokenMap
  /** Theme-keyed tokens — `{day: ..., night: ...}` shape for downstream writers */
  color: DimensionMap
  /** module.breakpoints.json — keyed by breakpoint */
  size: DimensionMap
  /** component.json day branch — keyed by component prefix */
  component: ComponentTokensJson
  /** breakpoints.json — pixel thresholds keyed by breakpoint name */
  breakpoints: BreakpointsJson
  /** Inverse-color values per group (the `$inverse` dimension), for getToken({ inverse }). */
  inverse: InverseData
}

/**
 * Parse a JSON file into the requested type. Single read site so call sites
 * stay tidy.
 */
function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Read base + alt-themes data and reconstitute the legacy `{core, themesDay,
 * themesNight}` split so downstream emit logic doesn't need to change.
 * Themed groups (color, backgroundColor, borderColor, …) are split out of the
 * merged base file by checking which group names appear in any alt theme.
 */
type InverseSub = { $themes?: DimensionMap; [variant: string]: unknown }

function readModule(tokensDir: string): { core: TokenMap; themesDay: TokenMap; themesNight: TokenMap; breakpoints: DimensionMap; inverse: InverseData } {
  const moduleJson = readModuleFolder<TokenMap & { $themes?: DimensionMap; $breakpoints?: DimensionMap; $inverse?: Record<string, InverseSub> }>(tokensDir)
  // Alt themes, breakpoint, and inverse overrides live under reserved `$themes`,
  // `$breakpoints`, and `$inverse` keys. Everything else at the top level is base.
  const { $themes: themes = {}, $breakpoints: embeddedBreakpoints, $inverse: inverseRaw = {}, ...base } = moduleJson
  // Themed groups = union of group keys across all alternative themes.
  const themedGroups = new Set<string>(Object.values(themes).flatMap((t) => Object.keys(t)))
  const core: TokenMap = {}
  const themesDay: TokenMap = {}
  for (const [group, variants] of Object.entries(base)) {
    if (themedGroups.has(group)) themesDay[group] = variants
    else core[group] = variants
  }
  // Split each `$inverse` sub-module into its day (base) and night values.
  const inverse: InverseData = {}
  for (const [group, sub] of Object.entries(inverseRaw)) {
    const { $themes: invThemes, ...invBase } = sub
    inverse[group] = { day: invBase as Record<string, string>, night: (invThemes?.night ?? {}) as Record<string, string> }
  }
  return { core, themesDay, themesNight: themes.night || {}, breakpoints: embeddedBreakpoints ?? {}, inverse }
}

/**
 * Read every token JSON source from tokensDir.
 */
/**
 * Read per-component token files from `tokens/components/`. Each file's stem
 * is the component prefix (`button.json` → `button`). Folds into the legacy
 * `componentTokens` shape so downstream emit logic is unchanged.
 */
function readComponentTokens(tokensDir: string): ComponentTokensJson {
  const componentsDir = path.join(tokensDir, 'components')
  const baseFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.json')).sort()
  const out: ComponentTokensJson = {}
  for (const filename of baseFiles) {
    const prefix = filename.replace(/\.json$/, '')
    const parsed = readJson<{ [key: string]: ComponentTokenNode } & { $themes?: unknown; $breakpoints?: unknown }>(
      path.join(componentsDir, filename)
    )
    // Strip the reserved override axes; this writer only emits the day/base branch.
    const { $themes, $breakpoints, ...base } = parsed
    out[prefix] = base as { [key: string]: ComponentTokenNode }
  }
  return out
}

export function readTokenJsonSources(tokensDir: string): TokenJsonSources {
  const { core, themesDay, themesNight, breakpoints: size, inverse } = readModule(tokensDir)
  const color: DimensionMap = { day: themesDay, night: themesNight }

  const component = readComponentTokens(tokensDir)
  const breakpoints = readJson<BreakpointsJson>(path.join(tokensDir, 'breakpoints.json'))
  return { core, color, size, component, breakpoints, inverse }
}
