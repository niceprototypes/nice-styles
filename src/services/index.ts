/**
 * Public API
 *
 * Services are the consumer-facing functions of nice-styles.
 * Internal utilities (camelToKebab, formatError, etc.) live in ../utilities/.
 */

export { getBreakpoint, getBreakpointValue } from './getBreakpoint.js'
export type { BreakpointName } from './getBreakpoint.js'
export {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
} from '../constants/breakpoints.js'
export type { BreakpointValues } from '../constants/breakpoints.js'
export { getToken, getTokenKey, getTokenValue } from './getToken.js'
export type { CoreTokenConfig } from './getToken.js'
export { getColorToken, getColorTokenKey, getColorTokenValue } from './getColorToken.js'
export { getSizeToken, getSizeTokenKey, getSizeTokenValue } from './getSizeToken.js'
export { setCoreTokens } from './setCoreTokens.js'
export { setColorTokens } from './setColorTokens.js'
export { setSizeTokens } from './setSizeTokens.js'
export { setBreakpoints } from './setBreakpoints.js'
export { getConstant, NAMESPACE } from './getConstant.js'
export type { CssConstantResult, CssConstantOptions } from './getConstant.js'
export { getComponentToken, getComponentTokenKey, getComponentTokenValue } from './getComponentToken.js'
export { getInvertedMode } from './getInvertedMode.js'
export { default as getTextHeight } from './getTextHeight.js'

// Re-exported from utilities for sibling packages (nice-react-styles)
export { getTokenFromMap, getTokenByPath } from '../utilities/getTokenFromMap.js'
export type { TokenDefinition, TokenMap, ComponentTokenNode, TokenResult, TokenFromMapOptions } from '../utilities/getTokenFromMap.js'
export { camelToKebab } from '../utilities/camelToKebab.js'
