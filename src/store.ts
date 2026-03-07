/**
 * Runtime token store.
 *
 * All token sources (core, color, size) are instances of the same
 * TokenModule concept — a dimensioned map of token groups processed
 * through the same pipeline.
 *
 * Core is a module with a single dimension key ("base").
 * Color is a module with dimension keys per mode ("day", "night").
 * Size is a module with dimension keys per breakpoint ("mobile", "tablet", "desktop").
 *
 * @example
 * // Initialization (called once at import time from generated defaults)
 * registerModule("core", "base", { base: coreTokensData })
 * registerModule("color", "day", { day: colorDay, night: colorNight })
 * registerModule("size", "mobile", { mobile: {}, tablet: {}, desktop: {} })
 *
 * @example
 * // Consumer overrides (called at app startup)
 * setModuleOverrides("core", { base: { gap: { base: "20px" } } })
 * setModuleOverrides("color", { night: { backgroundColor: { base: "black" } } })
 *
 * @example
 * // Value resolution (called by getters)
 * getModuleValue("core", undefined, "gap", "base")    // → "16px" (uses defaultKey "base")
 * getModuleValue("color", "night", "foregroundColor", "base")  // → night value
 */

import type { TokenMap } from './engine/separateTokens.js'
import { processTokens } from './engine/processTokens.js'

/** A keyed collection of token maps, one per dimension value (e.g., "day" → TokenMap, "night" → TokenMap) */
export type DimensionMap = Record<string, TokenMap>

/**
 * A token module represents a single axis of token variation.
 *
 * - `defaultKey`: The dimension value used when none is specified (e.g., "base" for core, "day" for color)
 * - `source`: Raw token data from JSON, keyed by dimension (e.g., { day: {...}, night: {...} })
 * - `overrides`: Consumer-provided overrides from setters, same shape as source
 * - `processed`: Result of running source + overrides through the processing pipeline
 */
export interface TokenModule {
  defaultKey: string
  source: DimensionMap
  overrides: DimensionMap
  processed: DimensionMap
}

/** Central registry of all token modules */
const modules = new Map<string, TokenModule>()

/** Creates an empty module shell with the given default dimension key */
function createModule(defaultKey: string): TokenModule {
  return {
    defaultKey,
    source: {},
    overrides: {},
    processed: {},
  }
}

/**
 * Runs the processing pipeline (static → replaced → derived) for every
 * dimension in a module. Each dimension is processed independently.
 */
function reprocess(mod: TokenModule): void {
  mod.processed = {}
  for (const key of Object.keys(mod.source)) {
    const overrides = mod.overrides[key]
    mod.processed[key] = processTokens(
      mod.source[key],
      overrides && Object.keys(overrides).length > 0 ? overrides : undefined
    )
  }
}

/**
 * Register a module with its source data and immediately process it.
 *
 * @param name - Module identifier ("core", "color", "size")
 * @param defaultKey - Dimension key used when none is specified ("base", "day", "mobile")
 * @param source - Raw token data keyed by dimension
 */
export function registerModule(
  name: string,
  defaultKey: string,
  source: DimensionMap
): void {
  const mod = createModule(defaultKey)
  mod.source = source
  modules.set(name, mod)
  reprocess(mod)
}

/**
 * Apply consumer overrides to a module and reprocess.
 * Overrides are merged additively — omitted groups/items are preserved.
 *
 * @param name - Module identifier
 * @param overrides - Override data keyed by dimension (same shape as source)
 */
export function setModuleOverrides(name: string, overrides: DimensionMap): void {
  const mod = modules.get(name)
  if (!mod) {
    throw new Error(`Module "${name}" not registered.`)
  }
  mod.overrides = overrides
  reprocess(mod)
}

/**
 * Get a module by name. Returns undefined if not registered.
 */
export function getModule(name: string): TokenModule | undefined {
  return modules.get(name)
}

/**
 * Resolve a single token value from a module.
 *
 * @param name - Module identifier ("core", "color", "size")
 * @param dimensionKey - Which dimension to look up (e.g., "night", "tablet"). Falls back to module's defaultKey if undefined.
 * @param group - Token group (e.g., "foregroundColor", "gap")
 * @param item - Token item within the group (e.g., "base", "large")
 * @returns The resolved value string, or undefined if not found
 */
export function getModuleValue(
  name: string,
  dimensionKey: string | undefined,
  group: string,
  item: string
): string | undefined {
  const mod = modules.get(name)
  if (!mod) return undefined

  const key = dimensionKey ?? mod.defaultKey
  const dimension = mod.processed[key]
  if (!dimension) return undefined

  return dimension[group]?.[item]
}