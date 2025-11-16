import { NumberedVariableProps, NamedVariableProps } from './types'
import {
  ANIMATION_DURATION_DEFAULT,
  ANIMATION_DURATION_SLOW,
  ANIMATION_EASING_DEFAULT,
  BACKGROUND_COLOR_PRIMARY,
  BACKGROUND_COLOR_SECONDARY,
  BORDER_COLOR_DARK,
  BORDER_COLOR_DARKER,
  BORDER_COLOR_DEFAULT,
  BORDER_RADIUS_DEFAULT,
  BORDER_RADIUS_LARGE,
  BORDER_RADIUS_LARGER,
  BORDER_RADIUS_SMALL,
  BORDER_RADIUS_SMALLER,
  BORDER_WIDTH_DEFAULT,
  BORDER_WIDTH_LARGE,
  BOX_SHADOW_DEFAULT,
  BOX_SHADOW_DEFAULT_REVERSE,
  BOX_SHADOW_LARGE,
  BOX_SHADOW_LARGE_REVERSE,
  CELL_HEIGHT_DEFAULT,
  CELL_HEIGHT_LARGE,
  CELL_HEIGHT_LARGER,
  CELL_HEIGHT_SMALL,
  CELL_HEIGHT_SMALLER,
  CONTENT_COLOR_DARK,
  CONTENT_COLOR_DARKER,
  CONTENT_COLOR_DEFAULT,
  CONTENT_COLOR_ERROR,
  CONTENT_COLOR_LIGHT,
  CONTENT_COLOR_LIGHTER,
  CONTENT_COLOR_LINK,
  CONTENT_COLOR_SUCCESS,
  CONTENT_COLOR_WARNING,
  FONT_FAMILY_BODY,
  FONT_FAMILY_CODE,
  FONT_FAMILY_HEADING,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_LARGE,
  FONT_SIZE_LARGER,
  FONT_SIZE_SMALL,
  FONT_SIZE_SMALLER,
  FONT_WEIGHT_BLACK,
  FONT_WEIGHT_BOLD,
  FONT_WEIGHT_EXTRABOLD,
  FONT_WEIGHT_LIGHT,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_REGULAR,
  FONT_WEIGHT_SEMIBOLD,
  GAP_SIZE_DEFAULT,
  GAP_SIZE_LARGE,
  GAP_SIZE_LARGER,
  GAP_SIZE_SMALL,
  GAP_SIZE_SMALLER,
  ICON_STROKE_WIDTH_DEFAULT,
  ICON_STROKE_WIDTH_LARGE,
  LINE_HEIGHT_CONDENSED,
  LINE_HEIGHT_DEFAULT,
  LINE_HEIGHT_EXPANDED,
} from './constants'

// Animation
export const animationDuration: NamedVariableProps = {
  default: ANIMATION_DURATION_DEFAULT,
  slow: ANIMATION_DURATION_SLOW,
}

export const animationEasing: NamedVariableProps = {
  default: ANIMATION_EASING_DEFAULT,
}

// Background Color
export const backgroundColor: NamedVariableProps = {
  primary: BACKGROUND_COLOR_PRIMARY,
  secondary: BACKGROUND_COLOR_SECONDARY,
}

export const backgroundColorReverse: NamedVariableProps = {
  dark: CONTENT_COLOR_DARK,
  darker: CONTENT_COLOR_DARKER,
  primary: CONTENT_COLOR_DEFAULT,
  light: CONTENT_COLOR_LIGHT,
  lighter: CONTENT_COLOR_LIGHTER,
}

// Border Color
export const borderColor: NamedVariableProps = {
  dark: BORDER_COLOR_DARK,
  darker: BORDER_COLOR_DARKER,
  default: BORDER_COLOR_DEFAULT,
}

export const borderColorReverse: NamedVariableProps = {
  dark: BACKGROUND_COLOR_PRIMARY,
  darker: BACKGROUND_COLOR_PRIMARY,
  default: CONTENT_COLOR_LIGHT,
}

// Border Radius
export const borderRadius: NamedVariableProps = {
  default: BORDER_RADIUS_DEFAULT,
  large: BORDER_RADIUS_LARGE,
  larger: BORDER_RADIUS_LARGER,
  small: BORDER_RADIUS_SMALL,
  smaller: BORDER_RADIUS_SMALLER,
}

// Border Width
export const borderWidth: NamedVariableProps = {
  default: BORDER_WIDTH_DEFAULT,
  large: BORDER_WIDTH_LARGE,
}

// Box Shadow
export const boxShadow: NamedVariableProps = {
  default: BOX_SHADOW_DEFAULT,
  defaultReverse: BOX_SHADOW_DEFAULT_REVERSE,
  large: BOX_SHADOW_LARGE,
  largeReverse: BOX_SHADOW_LARGE_REVERSE,
}

// Cell Height
export const cellHeight: NamedVariableProps = {
  default: CELL_HEIGHT_DEFAULT,
  large: CELL_HEIGHT_LARGE,
  larger: CELL_HEIGHT_LARGER,
  small: CELL_HEIGHT_SMALL,
  smaller: CELL_HEIGHT_SMALLER,
}

// Content Color
export const contentColor: NamedVariableProps = {
  dark: CONTENT_COLOR_DARK,
  darker: CONTENT_COLOR_DARKER,
  default: CONTENT_COLOR_DEFAULT,
  error: CONTENT_COLOR_ERROR,
  light: CONTENT_COLOR_LIGHT,
  lighter: CONTENT_COLOR_LIGHTER,
  link: CONTENT_COLOR_LINK,
  success: CONTENT_COLOR_SUCCESS,
  warning: CONTENT_COLOR_WARNING,
}

export const contentColorReverse: NamedVariableProps = {
  dark: BACKGROUND_COLOR_SECONDARY,
  darker: BACKGROUND_COLOR_PRIMARY,
  default: BACKGROUND_COLOR_PRIMARY,
  light: BACKGROUND_COLOR_PRIMARY,
}

// Font Family
export const fontFamily: NamedVariableProps = {
  body: FONT_FAMILY_BODY,
  code: FONT_FAMILY_CODE,
  heading: FONT_FAMILY_HEADING,
}

// Font Size
export const fontSize: NamedVariableProps = {
  default: FONT_SIZE_DEFAULT,
  large: FONT_SIZE_LARGE,
  larger: FONT_SIZE_LARGER,
  small: FONT_SIZE_SMALL,
  smaller: FONT_SIZE_SMALLER,
}

// Font Weight
export const fontWeight: NamedVariableProps = {
  black: FONT_WEIGHT_BLACK,
  bold: FONT_WEIGHT_BOLD,
  extrabold: FONT_WEIGHT_EXTRABOLD,
  light: FONT_WEIGHT_LIGHT,
  medium: FONT_WEIGHT_MEDIUM,
  regular: FONT_WEIGHT_REGULAR,
  semibold: FONT_WEIGHT_SEMIBOLD,
}

// Gap Size
export const gapSize: NamedVariableProps = {
  default: GAP_SIZE_DEFAULT,
  large: GAP_SIZE_LARGE,
  larger: GAP_SIZE_LARGER,
  small: GAP_SIZE_SMALL,
  smaller: GAP_SIZE_SMALLER,
}

// Icon Stroke Color
export const iconStrokeColor: NamedVariableProps = {
  default: CONTENT_COLOR_LIGHT,
  primary: CONTENT_COLOR_DARK,
}

export const iconStrokeColorReverse: NamedVariableProps = {
  default: CONTENT_COLOR_DARKER,
  primary: BACKGROUND_COLOR_PRIMARY,
}

// Icon Stroke Width
export const iconStrokeWidth: NamedVariableProps = {
  default: ICON_STROKE_WIDTH_DEFAULT,
  large: ICON_STROKE_WIDTH_LARGE,
}

// Line Height
export const lineHeight: NamedVariableProps = {
  condensed: LINE_HEIGHT_CONDENSED,
  default: LINE_HEIGHT_DEFAULT,
  expanded: LINE_HEIGHT_EXPANDED,
}


/**
 * Utility function to check if a variable exists
 */
export function hasVariable(category: string, key: string | number): boolean {
  const categoryMap: Record<string, NumberedVariableProps | NamedVariableProps> = {
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    backgroundColor: backgroundColor,
    backgroundColorReverse: backgroundColorReverse,
    borderColor: borderColor,
    borderColorReverse: borderColorReverse,
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    boxShadow: boxShadow,
    cellHeight: cellHeight,
    contentColor: contentColor,
    contentColorReverse: contentColorReverse,
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeight: fontWeight,
    gapSize: gapSize,
    iconStrokeColor: iconStrokeColor,
    iconStrokeColorReverse: iconStrokeColorReverse,
    iconStrokeWidth: iconStrokeWidth,
    lineHeight: lineHeight,
  }

  const vars = categoryMap[category]
  if (!vars) return false

  return key in vars
}

/**
 * Get all valid keys for a variable category
 */
export function getVariableKeys(category: string): (string | number)[] {
  const categoryMap: Record<string, NumberedVariableProps | NamedVariableProps> = {
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    boxShadow: boxShadow,
    cellHeight: cellHeight,
    contentColor: contentColor,
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeight: fontWeight,
    gapSize: gapSize,
    iconStrokeWidth: iconStrokeWidth,
    lineHeight: lineHeight,
  }

  const vars = categoryMap[category]
  return vars ? Object.keys(vars).map(k => isNaN(Number(k)) ? k : Number(k)) : []
}