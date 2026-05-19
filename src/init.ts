/**
 * Store initialization.
 *
 * Imports generated token data and registers all modules.
 * This file is imported by the main entry point (index.ts),
 * ensuring the store is populated before any getter is called.
 */

import { registerModule } from './store.js'
import coreData from './generated/tokensData.js'
import colorData from './generated/modeTokensData.js'
import sizeData from './generated/breakpointTokensData.js'
import { BREAKPOINT_PHONE } from './constants/breakpoints.js'

/** Wrap core's flat token map into the dimensioned format: { base: tokenMap } */
registerModule('core', 'base', { base: coreData })

/** Modes module dimensions come pre-keyed by mode: { day: {...}, night: {...} } */
registerModule('color', 'day', colorData)

/** Breakpoints module dimensions come pre-keyed by breakpoint: { phone: {...}, tablet: {...}, laptop: {...}, desktop: {...} } */
registerModule('size', BREAKPOINT_PHONE, sizeData)

// Seed the registry. Side-effect import — running this module mutates the
// singleton in `./registry/createRegistry.ts`. The registry is independent of
// the module store above; both are populated from the same source data.
import './registry/index.js'