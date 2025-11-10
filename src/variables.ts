import { NumberedVariables, NamedVariables } from './types'

/**
 * LEVEL 0: BASE VARIABLES
 * These are the foundational design tokens
 */

// Animation
export const animationDuration: NumberedVariables = {
  1: '300ms',
  2: '600ms',
}

export const animationEasing: NamedVariables = {
  '1': 'ease-in-out',
}

// Background Color
export const backgroundColor: NumberedVariables = {
  1: 'hsla(0, 100%, 100%, 1)',
  2: 'hsla(210, 10%, 96%, 1)',
}

// Border Color
export const borderColor: NamedVariables = {
  default: 'hsla(240, 9%, 91%, 1)',
  primary: 'hsla(210, 10%, 25%, 1)',
}

// Border Radius
export const borderRadius: NumberedVariables = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
}

// Border Width
export const borderWidth: NumberedVariables = {
  1: '1.5px',
  2: '2px',
}

// Box Shadow
export const boxShadow: NamedVariables = {
  '1': '0 1px 4px hsla(0, 0%, 0%, 0.075)',
  '2': '0 2px 8px hsla(0, 0%, 0%, 0.1)',
  '2-reverse': '0 -2px 8px hsla(0, 0%, 0%, 0.1)',
}

// Cell Height
export const cellHeight: NumberedVariables = {
  1: '24px',
  2: '40px',
  3: '56px',
  4: '64px',
  5: '72px',
}

// Content Color
export const contentColor: NamedVariables = {
  '1': 'hsla(210, 15%, 5%, 1)',
  '2': 'hsla(210, 5%, 38%, 1)',
  '3': 'hsla(210, 5%, 60%, 1)',
  '4': 'hsla(210, 5%, 85%, 1)',
  active: 'hsla(202, 100%, 50%, 1)',
  success: 'hsla(146, 68%, 44%, 1)',
  error: 'hsla(10, 92%, 63%, 1)',
  warning: 'hsla(29, 98%, 62%, 1)',
}

// Font Family
export const fontFamily: NamedVariables = {
  heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  code: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New"',
}

// Font Size
export const fontSize: NumberedVariables = {
  1: '12px',
  2: '14px',
  3: '16px',
  4: '20px',
  5: '24px',
}

// Gap Size
export const gapSize: NumberedVariables = {
  1: '4px',
  2: '8px',
  3: '16px',
  4: '32px',
  5: '48px',
}

// Icon Stroke Width
export const iconStrokeWidth: NumberedVariables = {
  1: '1.5px',
  2: '2px',
}

// Line Height
export const lineHeight: NamedVariables = {
  default: '1.5',
  condensed: '1.25',
}

/**
 * LEVEL 0: COMPONENT-SPECIFIC VARIABLES
 */

// Floatie
export const launcherLogoHeight: NamedVariables = {
  sm: '64px',
  md: '64px',
}

export const floatiePreviewHeight: NamedVariables = {
  md: '420px',
}

// ProgressBar
export const progressBar: NamedVariables = {
  height: '6px',
}

/**
 * LEVEL 1: DERIVED VARIABLES
 * These reference other CSS variables
 */

// Background Color Inverse
export const backgroundColorInverse: NamedVariables = {
  '1': 'var(--content-color-1)',
  '2': 'var(--content-color-2)',
  '3': 'var(--content-color-3)',
  '4': 'var(--content-color-4)',
}

// Content Color Inverse
export const contentColorInverse: NamedVariables = {
  '1': 'var(--background-color-1)',
  '2': 'var(--background-color-2)',
  '3': 'var(--background-color-1)',
  '4': 'var(--background-color-1)',
}

// Border Color Inverse
export const borderColorInverse: NamedVariables = {
  default: 'var(--content-color-4)',
  primary: 'var(--background-color-1)',
}

// Content Color Status
export const contentColorStatus: NamedVariables = {
  default: 'var(--content-color-2)',
  active: 'var(--content-color-1)',
  disabled: 'var(--content-color-4)',
}

// Icon Stroke Color
export const iconStrokeColor: NamedVariables = {
  default: 'var(--content-color-4)',
  primary: 'var(--content-color-2)',
}

// Icon Stroke Color Inverse
export const iconStrokeColorInverse: NamedVariables = {
  default: 'var(--content-color-1)',
  primary: 'var(--background-color-1)',
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
    'gap-size': gapSize,
    'icon-stroke-width': iconStrokeWidth,
    'line-height': lineHeight,
    'launcher-logo-height': launcherLogoHeight,
    'floatie-preview-height': floatiePreviewHeight,
    'progress-bar': progressBar,
    'background-color-inverse': backgroundColorInverse,
    'content-color-inverse': contentColorInverse,
    'border-color-inverse': borderColorInverse,
    'content-color-status': contentColorStatus,
    'icon-stroke-color': iconStrokeColor,
    'icon-stroke-color-inverse': iconStrokeColorInverse,
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
    'gap-size': gapSize,
    'icon-stroke-width': iconStrokeWidth,
    'line-height': lineHeight,
  }

  const vars = categoryMap[category]
  return vars ? Object.keys(vars).map(k => isNaN(Number(k)) ? k : Number(k)) : []
}