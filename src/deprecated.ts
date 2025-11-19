/**
 * Deprecated CSS Variable Mappings
 *
 * This file contains mappings from current CSS variable names to their deprecated equivalents.
 * The generate-deprecated-css.ts script uses this data to automatically generate deprecated.css
 *
 * Format: { "current-var-name": ["deprecated-var-1", "deprecated-var-2"] }
 */

export const deprecatedMappings: Record<string, string[]> = {
  "background-color-base": ["background-color-1", "background-color-default"],
  "background-color-alternate": ["background-color-2", "background-color-active"],
  "foreground-color-lighter": ["content-color-lighter"],
  "foreground-color-light": ["content-color-light"],
  "foreground-color-medium": ["content-color-medium"],
  "foreground-color-heavy": ["content-color-dark", "foreground-color-dark"],
  "foreground-color-base": ["content-color-base", "content-color-default"],
  "foreground-color-link": ["content-color-link"],
  "foreground-color-success": ["content-color-success"],
  "foreground-color-warning": ["content-color-warning"],
  "foreground-color-error": ["content-color-error"],
  "border-color-heavy": ["border-color-dark"],
  "border-color-heavier": ["border-color-darker"],
  "gap-smaller": ["gap-size-1", "gap-size-2"],
  "gap-small": ["gap-size-3"],
  "gap-base": ["gap-size-4"],
  "gap-large": ["gap-size-5"],
  "gap-larger": ["gap-size-6"],
  "border-width-base": ["icon-stroke-width-base"],
  "border-width-large": ["icon-stroke-width-large"],
}

// Deprecated constants - will be removed in v5.0.0
import {
  BORDER_COLOR_HEAVY,
  BORDER_COLOR_HEAVIER,
  FOREGROUND_COLOR_HEAVY,
} from './constants.js'

/**
 * @deprecated Use BORDER_COLOR_HEAVY instead. Will be removed in v5.0.0
 */
export const BORDER_COLOR_DARK = BORDER_COLOR_HEAVY

/**
 * @deprecated Use BORDER_COLOR_HEAVIER instead. Will be removed in v5.0.0
 */
export const BORDER_COLOR_DARKER = BORDER_COLOR_HEAVIER

/**
 * @deprecated Use FOREGROUND_COLOR_HEAVY instead. Will be removed in v5.0.0
 */
export const FOREGROUND_COLOR_DARK = FOREGROUND_COLOR_HEAVY
