/**
 * Public API
 *
 * Services are the consumer-facing functions of nice-styles.
 * Internal utilities (camelToKebab, formatError, etc.) live in ../utilities/.
 */

export { getBreakpoint } from './getBreakpoint.js'
export type { BreakpointResult, BreakpointName } from './getBreakpoint.js'
export { getCoreToken } from './getCoreToken.js'
export { getConstant, NAMESPACE } from './getConstant.js'
export type { CssConstantResult, CssConstantOptions } from './getConstant.js'
export { getComponentToken } from './getComponentToken.js'
export { getInvertedMode } from './getInvertedMode.js'

// Re-exported from utilities for sibling packages (nice-react-styles)
export { getTokenFromMap } from '../utilities/getTokenFromMap.js'
export type { TokenDefinition, TokenMap, TokenResult, TokenFromMapOptions } from '../utilities/getTokenFromMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'
