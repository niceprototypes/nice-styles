/**
 * Token registry barrel.
 *
 * Importing this module triggers the seed (flat core tokens + dimensioned
 * theme + breakpoint tokens). The registry singleton lives in `./createRegistry.ts`;
 * everything else here is seeding and re-exports.
 */

import tokensData from '../generated/tokensData.js'
import themeTokensData from '../generated/themeTokensData.js'
import breakpointTokensData from '../generated/breakpointTokensData.js'
import { DEFAULT_THEME } from '../constants/styleValues.js'
import { BREAKPOINT_PHONE } from '../constants/breakpoints.js'
import { registry, type RegistryEntry } from './createRegistry.js'
import { seedDimensionedTokens } from './seedDimensionedTokens.js'

// Seed: flat core tokens (animationDuration, gap, borderRadius, etc.).
for (const [name, def] of Object.entries(tokensData)) {
  registry.set(name, {
    variants: def as Record<string, string | number>,
    themes: new Set([DEFAULT_THEME]),
  })
}

// Seed: dimensioned token modules.
// - themeTokensData is keyed by theme (day, night). The theme keys ARE themes, so they're recorded on each entry's `themes` Set.
// - breakpointTokensData is keyed by breakpoint (phone, tablet, laptop, desktop). Breakpoints are NOT themes, so each entry keeps `themes` at DEFAULT_THEME only.
seedDimensionedTokens(registry, [
  {
    data: themeTokensData as unknown as Record<string, Record<string, Record<string, string>>>,
    defaultDim: DEFAULT_THEME,
    themesForEntry: new Set(Object.keys(themeTokensData)),
  },
  {
    data: breakpointTokensData as unknown as Record<string, Record<string, Record<string, string>>>,
    defaultDim: BREAKPOINT_PHONE,
    themesForEntry: new Set([DEFAULT_THEME]),
  },
])

/**
 * Pristine snapshot of the registry, deep-cloned immediately after seeding —
 * before any consumer `setTokens` / `registerTokens` mutates the live registry.
 * Readers that must show canonical defaults regardless of runtime overrides
 * (the token reference docs, tooling) resolve against this via the getters'
 * `pristine` option. Variant objects are plain string/number maps (or nested
 * ThemeValue/BreakpointValue string maps), so a JSON clone is sufficient.
 */
export const defaultsRegistry = new Map<string, RegistryEntry>()
for (const [name, entry] of registry) {
  defaultsRegistry.set(name, {
    prefix: entry.prefix,
    variants: JSON.parse(JSON.stringify(entry.variants)),
    themes: new Set(entry.themes),
  })
}

export { registry } from './createRegistry.js'
export type { RegistryEntry } from './createRegistry.js'
export { registerTokens } from './registerTokens.js'
export { seedDimensionedTokens } from './seedDimensionedTokens.js'
export type { DimensionedTokenSeed } from './seedDimensionedTokens.js'