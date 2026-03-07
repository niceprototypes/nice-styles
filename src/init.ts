/**
 * Store initialization.
 *
 * Imports generated token data and registers all modules.
 * This file is imported by the main entry point (index.ts),
 * ensuring the store is populated before any getter is called.
 */

import { registerModule } from './store.js'
import coreData from './generated/tokensData.js'
import colorData from './generated/colorTokensData.js'
import sizeData from './generated/sizeTokensData.js'

/** Wrap core's flat token map into the dimensioned format: { base: tokenMap } */
registerModule('core', 'base', { base: coreData })

/** Color module dimensions come pre-keyed by mode: { day: {...}, night: {...} } */
registerModule('color', 'day', colorData)

/** Size module dimensions come pre-keyed by breakpoint: { mobile: {...}, tablet: {...}, desktop: {...} } */
registerModule('size', 'mobile', sizeData)