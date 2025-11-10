/**
 * nice-css-variables
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
  launcherLogoHeight,
  floatiePreviewHeight,
  progressBar,
  backgroundColorInverse,
  contentColorInverse,
  borderColorInverse,
  contentColorStatus,
  iconStrokeColor,
  iconStrokeColorInverse,
  hasVariable,
  getVariableKeys,
} from './variables'

// Export types
export type { CSSVariable, CSSVariableGroup, NumberedVariables, NamedVariables } from './types'