/**
 * Token registry barrel.
 *
 * Importing this module triggers the seed (flat core tokens + dimensioned
 * color + breakpoint tokens). The registry singleton lives in `./createRegistry.ts`;
 * everything else here is seeding and re-exports.
 */

import tokensData from '../generated/tokensData.js'
import modeTokensData from '../generated/modeTokensData.js'
import breakpointTokensData from '../generated/breakpointTokensData.js'
import { DEFAULT_MODE } from '../constants/styleValues.js'
import { BREAKPOINT_PHONE } from '../constants/breakpoints.js'
import { registry } from './createRegistry.js'
import { seedDimensionedTokens } from './seedDimensionedTokens.js'

// Seed: flat core tokens (animationDuration, gap, borderRadius, etc.).
for (const [name, def] of Object.entries(tokensData)) {
  registry.set(name, {
    variants: def as Record<string, string | number>,
    modes: new Set([DEFAULT_MODE]),
  })
}

// Seed: dimensioned token modules.
// - modeTokensData is keyed by mode (day, night). The mode keys ARE modes, so they're recorded on each entry's `modes` Set.
// - breakpointTokensData is keyed by breakpoint (phone, tablet, laptop, desktop). Breakpoints are NOT modes, so each entry keeps `modes` at DEFAULT_MODE only.
seedDimensionedTokens(registry, [
  {
    data: modeTokensData as unknown as Record<string, Record<string, Record<string, string>>>,
    defaultDim: DEFAULT_MODE,
    modesForEntry: new Set(Object.keys(modeTokensData)),
  },
  {
    data: breakpointTokensData as unknown as Record<string, Record<string, Record<string, string>>>,
    defaultDim: BREAKPOINT_PHONE,
    modesForEntry: new Set([DEFAULT_MODE]),
  },
])

export { registry } from './createRegistry.js'
export type { RegistryEntry } from './createRegistry.js'
export { registerTokens } from './registerTokens.js'
export { seedDimensionedTokens } from './seedDimensionedTokens.js'
export type { DimensionedTokenSeed } from './seedDimensionedTokens.js'
