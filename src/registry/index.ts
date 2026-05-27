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
import { registry } from './createRegistry.js'
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

export { registry } from './createRegistry.js'
export type { RegistryEntry } from './createRegistry.js'
export { registerTokens } from './registerTokens.js'
export { seedDimensionedTokens } from './seedDimensionedTokens.js'
export type { DimensionedTokenSeed } from './seedDimensionedTokens.js'