import { NumberedVariables, NamedVariables } from './types'
import {
  ANIMATION_DURATION_DEFAULT,
  ANIMATION_DURATION_SLOW,
  ANIMATION_EASING_DEFAULT,
  BACKGROUND_COLOR_DEFAULT,
  BACKGROUND_COLOR_ACTIVE,
  BORDER_COLOR_SECONDARY,
  BORDER_COLOR_PRIMARY,
  BORDER_RADIUS_SMALLER,
  BORDER_RADIUS_SMALL,
  BORDER_RADIUS_DEFAULT,
  BORDER_RADIUS_LARGE,
  BORDER_RADIUS_LARGER,
  BORDER_WIDTH_DEFAULT,
  BORDER_WIDTH_LARGE,
  BOX_SHADOW_DEFAULT,
  BOX_SHADOW_DEFAULT_REVERSE,
  BOX_SHADOW_LARGE,
  BOX_SHADOW_LARGE_REVERSE,
  CELL_HEIGHT_SMALLER,
  CELL_HEIGHT_SMALL,
  CELL_HEIGHT_DEFAULT,
  CELL_HEIGHT_LARGE,
  CELL_HEIGHT_LARGER,
  CONTENT_COLOR_DARKER,
  CONTENT_COLOR_DARK,
  CONTENT_COLOR_DEFAULT,
  CONTENT_COLOR_LIGHT,
  CONTENT_COLOR_LIGHTER,
  CONTENT_COLOR_ACTIVE,
  CONTENT_COLOR_SUCCESS,
  CONTENT_COLOR_ERROR,
  CONTENT_COLOR_WARNING,
  FONT_FAMILY_HEADING,
  FONT_FAMILY_BODY,
  FONT_FAMILY_CODE,
  FONT_SIZE_SMALLER,
  FONT_SIZE_SMALL,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_LARGE,
  FONT_SIZE_LARGER,
  FONT_WEIGHT_LIGHT,
  FONT_WEIGHT_REGULAR,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_SEMIBOLD,
  FONT_WEIGHT_BOLD,
  FONT_WEIGHT_EXTRABOLD,
  FONT_WEIGHT_BLACK,
  GAP_SIZE_SMALLER,
  GAP_SIZE_SMALL,
  GAP_SIZE_DEFAULT,
  GAP_SIZE_LARGE,
  GAP_SIZE_LARGER,
  ICON_STROKE_WIDTH_DEFAULT,
  ICON_STROKE_WIDTH_LARGE,
  LINE_HEIGHT_EXPANDED,
  LINE_HEIGHT_DEFAULT,
  LINE_HEIGHT_CONDENSED,
} from './constants'

/**
 * LEVEL 0: BASE VARIABLES
 * These are the foundational design tokens
 */

// Animation (Semantic)
export const animationDuration: NamedVariables = {
  default: ANIMATION_DURATION_DEFAULT,
  slow: ANIMATION_DURATION_SLOW,
}

export const animationEasing: NamedVariables = {
  default: ANIMATION_EASING_DEFAULT,
}

// Background Color (Semantic)
export const backgroundColor: NamedVariables = {
  default: BACKGROUND_COLOR_DEFAULT,
  active: BACKGROUND_COLOR_ACTIVE,
}

// Border Color
export const borderColor: NamedVariables = {
  primary: BORDER_COLOR_PRIMARY,
  secondary: BORDER_COLOR_SECONDARY,
}

// Border Radius (Semantic)
export const borderRadius: NamedVariables = {
  smaller: BORDER_RADIUS_SMALLER,
  small: BORDER_RADIUS_SMALL,
  default: BORDER_RADIUS_DEFAULT,
  large: BORDER_RADIUS_LARGE,
  larger: BORDER_RADIUS_LARGER,
}

// Border Width (Semantic)
export const borderWidth: NamedVariables = {
  default: BORDER_WIDTH_DEFAULT,
  large: BORDER_WIDTH_LARGE,
}

// Box Shadow (Semantic)
export const boxShadow: NamedVariables = {
  default: BOX_SHADOW_DEFAULT,
  'default-reverse': BOX_SHADOW_DEFAULT_REVERSE,
  large: BOX_SHADOW_LARGE,
  'large-reverse': BOX_SHADOW_LARGE_REVERSE,
}

// Cell Height (Semantic)
export const cellHeight: NamedVariables = {
  smaller: CELL_HEIGHT_SMALLER,
  small: CELL_HEIGHT_SMALL,
  default: CELL_HEIGHT_DEFAULT,
  large: CELL_HEIGHT_LARGE,
  larger: CELL_HEIGHT_LARGER,
}

// Content Color (Semantic)
export const contentColor: NamedVariables = {
  darker: CONTENT_COLOR_DARKER,
  dark: CONTENT_COLOR_DARK,
  default: CONTENT_COLOR_DEFAULT,
  light: CONTENT_COLOR_LIGHT,
  lighter: CONTENT_COLOR_LIGHTER,
  active: CONTENT_COLOR_ACTIVE,
  success: CONTENT_COLOR_SUCCESS,
  error: CONTENT_COLOR_ERROR,
  warning: CONTENT_COLOR_WARNING,
}

// Font Family
export const fontFamily: NamedVariables = {
  heading: FONT_FAMILY_HEADING,
  body: FONT_FAMILY_BODY,
  code: FONT_FAMILY_CODE,
}

// Font Size (Semantic)
export const fontSize: NamedVariables = {
  smaller: FONT_SIZE_SMALLER,
  small: FONT_SIZE_SMALL,
  default: FONT_SIZE_DEFAULT,
  large: FONT_SIZE_LARGE,
  larger: FONT_SIZE_LARGER,
}

// Font Weight (Semantic)
export const fontWeight: NamedVariables = {
  light: FONT_WEIGHT_LIGHT,
  regular: FONT_WEIGHT_REGULAR,
  medium: FONT_WEIGHT_MEDIUM,
  semibold: FONT_WEIGHT_SEMIBOLD,
  bold: FONT_WEIGHT_BOLD,
  extrabold: FONT_WEIGHT_EXTRABOLD,
  black: FONT_WEIGHT_BLACK,
}

// Gap Size (Semantic)
export const gapSize: NamedVariables = {
  smaller: GAP_SIZE_SMALLER,
  small: GAP_SIZE_SMALL,
  default: GAP_SIZE_DEFAULT,
  large: GAP_SIZE_LARGE,
  larger: GAP_SIZE_LARGER,
}

// Icon Stroke Width (Semantic)
export const iconStrokeWidth: NamedVariables = {
  default: ICON_STROKE_WIDTH_DEFAULT,
  large: ICON_STROKE_WIDTH_LARGE,
}

// Line Height
export const lineHeight: NamedVariables = {
  expanded: LINE_HEIGHT_EXPANDED,
  default: LINE_HEIGHT_DEFAULT,
  condensed: LINE_HEIGHT_CONDENSED,
}

/**
 * LEVEL 1: DERIVED VARIABLES
 * These use actual color values instead of CSS variable references
 */

// Background Color Reverse
export const backgroundColorReverse: NamedVariables = {
  darker: CONTENT_COLOR_DARKER,
  dark: CONTENT_COLOR_DARK,
  default: CONTENT_COLOR_DEFAULT,
  light: CONTENT_COLOR_LIGHT,
  lighter: CONTENT_COLOR_LIGHTER,
}

// Content Color Reverse
export const contentColorReverse: NamedVariables = {
  darker: BACKGROUND_COLOR_DEFAULT,
  dark: BACKGROUND_COLOR_ACTIVE,
  default: BACKGROUND_COLOR_DEFAULT,
  light: BACKGROUND_COLOR_DEFAULT,
}

// Border Color Reverse
export const borderColorReverse: NamedVariables = {
  secondary: CONTENT_COLOR_LIGHT,
  primary: BACKGROUND_COLOR_DEFAULT,
}

// Content Color Status
export const contentColorStatus: NamedVariables = {
  default: CONTENT_COLOR_DARK,
  active: CONTENT_COLOR_DARKER,
  disabled: CONTENT_COLOR_LIGHT,
}

// Icon Stroke Color
export const iconStrokeColor: NamedVariables = {
  default: CONTENT_COLOR_LIGHT,
  primary: CONTENT_COLOR_DARK,
}

// Icon Stroke Color Reverse
export const iconStrokeColorReverse: NamedVariables = {
  default: CONTENT_COLOR_DARKER,
  primary: BACKGROUND_COLOR_DEFAULT,
}


/**
 * Utility function to check if a variable exists
 */
export function hasVariable(category: string, key: string | number): boolean {
  const categoryMap: Record<string, NumberedVariables | NamedVariables> = {
    'animation-duration': animationDuration,
    'animation-easing': animationEasing,
    'background-color': backgroundColor,
    'border-color': borderColor,
    'border-radius': borderRadius,
    'border-width': borderWidth,
    'box-shadow': boxShadow,
    'cell-height': cellHeight,
    'content-color': contentColor,
    'font-family': fontFamily,
    'font-size': fontSize,
    'font-weight': fontWeight,
    'gap-size': gapSize,
    'icon-stroke-width': iconStrokeWidth,
    'line-height': lineHeight,
    'background-color-reverse': backgroundColorReverse,
    'content-color-reverse': contentColorReverse,
    'border-color-reverse': borderColorReverse,
    'content-color-status': contentColorStatus,
    'icon-stroke-color': iconStrokeColor,
    'icon-stroke-color-reverse': iconStrokeColorReverse,
  }

  const vars = categoryMap[category]
  if (!vars) return false

  return key in vars
}

/**
 * Get all valid keys for a variable category
 */
export function getVariableKeys(category: string): (string | number)[] {
  const categoryMap: Record<string, NumberedVariables | NamedVariables> = {
    'animation-duration': animationDuration,
    'animation-easing': animationEasing,
    'background-color': backgroundColor,
    'border-color': borderColor,
    'border-radius': borderRadius,
    'border-width': borderWidth,
    'box-shadow': boxShadow,
    'cell-height': cellHeight,
    'content-color': contentColor,
    'font-family': fontFamily,
    'font-size': fontSize,
    'font-weight': fontWeight,
    'gap-size': gapSize,
    'icon-stroke-width': iconStrokeWidth,
    'line-height': lineHeight,
  }

  const vars = categoryMap[category]
  return vars ? Object.keys(vars).map(k => isNaN(Number(k)) ? k : Number(k)) : []
}