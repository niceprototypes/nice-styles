/**
 * Deprecated Variables
 * These variable groups are kept for backwards compatibility but should not be used in new code.
 * Import deprecated constants from constants.deprecated.ts
 */

import { NumberedVariableProps, NamedVariableProps } from './types.js'
import {
  ANIMATION_DURATION_1,
  ANIMATION_DURATION_2,
  ANIMATION_EASING_1,
  BACKGROUND_COLOR_1,
  BACKGROUND_COLOR_2,
  BORDER_COLOR_1,
  BORDER_COLOR_2,
  BORDER_COLOR_3,
  BORDER_RADIUS_1,
  BORDER_RADIUS_2,
  BORDER_RADIUS_3,
  BORDER_RADIUS_4,
  BORDER_WIDTH_1,
  BORDER_WIDTH_2,
  BOX_SHADOW_1,
  BOX_SHADOW_1_REVERSE,
  BOX_SHADOW_2,
  BOX_SHADOW_2_REVERSE,
  CELL_HEIGHT_1,
  CELL_HEIGHT_2,
  CELL_HEIGHT_3,
  CELL_HEIGHT_4,
  CELL_HEIGHT_5,
  CONTENT_COLOR_1,
  CONTENT_COLOR_2,
  CONTENT_COLOR_3,
  CONTENT_COLOR_4,
  CONTENT_COLOR_5,
  FONT_SIZE_1,
  FONT_SIZE_2,
  FONT_SIZE_3,
  FONT_SIZE_4,
  FONT_SIZE_5,
  GAP_SIZE_1,
  GAP_SIZE_2,
  GAP_SIZE_3,
  GAP_SIZE_4,
  GAP_SIZE_5,
  ICON_STROKE_WIDTH_1,
  ICON_STROKE_WIDTH_2,
} from './constants.deprecated.js'

// Animation (Deprecated - use semantic names)
/** @deprecated Use animationDuration.default instead of animationDuration[1] */
export const animationDurationDeprecated: NumberedVariableProps = {
  1: ANIMATION_DURATION_1,
  2: ANIMATION_DURATION_2,
}

/** @deprecated Use animationEasing.default instead of animationEasing['1'] */
export const animationEasingDeprecated: NamedVariableProps = {
  '1': ANIMATION_EASING_1,
}

// Background Color (Deprecated - use semantic names)
/** @deprecated Use backgroundColor.primary instead of backgroundColor[1] */
export const backgroundColorDeprecated: NumberedVariableProps = {
  1: BACKGROUND_COLOR_1,
  2: BACKGROUND_COLOR_2,
}

// Border Color (Deprecated - use semantic names)
/** @deprecated Use borderColor.default instead of borderColor[1] */
export const borderColorDeprecated: NumberedVariableProps = {
  1: BORDER_COLOR_1,
  2: BORDER_COLOR_2,
  3: BORDER_COLOR_3,
}

// Border Radius (Deprecated - use semantic names)
/** @deprecated Use borderRadius.small instead of borderRadius[1] */
export const borderRadiusDeprecated: NumberedVariableProps = {
  1: BORDER_RADIUS_1,
  2: BORDER_RADIUS_2,
  3: BORDER_RADIUS_3,
  4: BORDER_RADIUS_4,
}

// Border Width (Deprecated - use semantic names)
/** @deprecated Use borderWidth.default instead of borderWidth[1] */
export const borderWidthDeprecated: NumberedVariableProps = {
  1: BORDER_WIDTH_1,
  2: BORDER_WIDTH_2,
}

// Box Shadow (Deprecated - use semantic names)
/** @deprecated Use boxShadow.default instead of boxShadow['1'] */
export const boxShadowDeprecated: NamedVariableProps = {
  '1': BOX_SHADOW_1,
  '1Reverse': BOX_SHADOW_1_REVERSE,
  '2': BOX_SHADOW_2,
  '2Reverse': BOX_SHADOW_2_REVERSE,
}

// Cell Height (Deprecated - use semantic names)
/** @deprecated Use cellHeight.smaller instead of cellHeight[1] */
export const cellHeightDeprecated: NumberedVariableProps = {
  1: CELL_HEIGHT_1,
  2: CELL_HEIGHT_2,
  3: CELL_HEIGHT_3,
  4: CELL_HEIGHT_4,
  5: CELL_HEIGHT_5,
}

// Content Color (Deprecated - use semantic names)
/** @deprecated Use contentColor.darker instead of contentColor['1'] */
export const contentColorDeprecated: NamedVariableProps = {
  '1': CONTENT_COLOR_1,
  '2': CONTENT_COLOR_2,
  '3': CONTENT_COLOR_3,
  '4': CONTENT_COLOR_4,
  '5': CONTENT_COLOR_5,
}

// Font Size (Deprecated - use semantic names)
/** @deprecated Use fontSize.smaller instead of fontSize[1] */
export const fontSizeDeprecated: NumberedVariableProps = {
  1: FONT_SIZE_1,
  2: FONT_SIZE_2,
  3: FONT_SIZE_3,
  4: FONT_SIZE_4,
  5: FONT_SIZE_5,
}

// Gap Size (Deprecated - use semantic names)
/** @deprecated Use gapSize.smaller instead of gapSize[1] */
export const gapSizeDeprecated: NumberedVariableProps = {
  1: GAP_SIZE_1,
  2: GAP_SIZE_2,
  3: GAP_SIZE_3,
  4: GAP_SIZE_4,
  5: GAP_SIZE_5,
}

// Icon Stroke Width (Deprecated - use semantic names)
/** @deprecated Use iconStrokeWidth.default instead of iconStrokeWidth[1] */
export const iconStrokeWidthDeprecated: NumberedVariableProps = {
  1: ICON_STROKE_WIDTH_1,
  2: ICON_STROKE_WIDTH_2,
}
