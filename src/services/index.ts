/**
 * Public API
 *
 * Services are the consumer-facing functions of nice-styles.
 * Internal utilities (camelToKebab, formatError, etc.) live in ../utilities/.
 */

export { getBreakpoint } from './getBreakpoint.js'
export type { BreakpointResult, BreakpointName } from './getBreakpoint.js'
export { getCoreToken } from './getCoreToken.js'
export type { CoreTokenConfig } from './getCoreToken.js'
export { getColorToken } from './getColorToken.js'
export { getSizeToken } from './getSizeToken.js'
export { setCoreTokens } from './setCoreTokens.js'
export { setColorTokens } from './setColorTokens.js'
export { setSizeTokens } from './setSizeTokens.js'
export { getConstant, NAMESPACE } from './getConstant.js'
export type { CssConstantResult, CssConstantOptions } from './getConstant.js'
export { getComponentToken } from './getComponentToken.js'
export { getInvertedMode } from './getInvertedMode.js'
export { default as getTextHeight } from './getTextHeight.js'

// Re-exported from utilities for sibling packages (nice-react-styles)
export { getTokenFromMap, getTokenByPath } from '../utilities/getTokenFromMap.js'
export type { TokenDefinition, TokenMap, ComponentTokenNode, TokenResult, TokenFromMapOptions } from '../utilities/getTokenFromMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'
