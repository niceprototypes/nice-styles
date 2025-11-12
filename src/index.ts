/**
 * nice-styles
 * A collection of CSS custom properties (variables) for consistent design tokens
 */

// Export all variable definitions
export {
  animationDuration,
  animationEasing,
  backgroundColor,
  borderColor,
  borderRadius,
  borderWidth,
  boxShadow,
  cellHeight,
  contentColor,
  fontFamily,
  fontSize,
  gapSize,
  iconStrokeWidth,
  lineHeight,
  backgroundColorReverse,
  contentColorReverse,
  borderColorReverse,
  contentColorStatus,
  iconStrokeColor,
  iconStrokeColorReverse,
  hasVariable,
  getVariableKeys,
} from './variables'

// Export deprecated variable groups
export {
  animationDurationDeprecated,
  animationEasingDeprecated,
  backgroundColorDeprecated,
  borderColorDeprecated,
  borderRadiusDeprecated,
  borderWidthDeprecated,
  boxShadowDeprecated,
  cellHeightDeprecated,
  contentColorDeprecated,
  fontSizeDeprecated,
  gapSizeDeprecated,
  iconStrokeWidthDeprecated,
} from './variables.deprecated'

// Export all constants
export * from './constants'

// Export deprecated constants
export * from './constants.deprecated'

// Export types
export type { CSSVariable, CSSVariableGroup, NumberedVariables, NamedVariables } from './types'