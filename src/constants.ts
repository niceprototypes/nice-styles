/**
 * Design System Constants
 *
 * This file contains all the raw design token values for the nice-styles design system.
 * These constants are the single source of truth for all design tokens.
 *
 * ## Architecture
 * Constants are organized into token groups using `// Token: TOKEN_NAME` comments.
 * These comments are parsed by scripts/generate-tokens.ts to automatically generate:
 * - src/tokens.ts (TypeScript token exports)
 * - variables.css (CSS custom properties)
 * - dist/css/*.css (individual CSS files per token)
 *
 * ## Naming Convention
 * - Constants use SCREAMING_SNAKE_CASE
 * - Token groups are prefixed (e.g., FONT_SIZE_BASE, FONT_SIZE_LARGE)
 * - Generated tokens use camelCase (e.g., fontSize.base, fontSize.large)
 * - Generated CSS vars use kebab-case (e.g., --font-size-base, --font-size-large)
 *
 * ## Usage
 * This file should be the ONLY file you manually edit when adding/changing design tokens.
 * After editing, run `npm run build:tokens` to regenerate all derived files.
 *
 * @module constants
 */

// Token: ANIMATION_DURATION
export const ANIMATION_DURATION_BASE = "300ms"
export const ANIMATION_DURATION_SLOW = "600ms"

// Token: ANIMATION_EASING
export const ANIMATION_EASING_BASE = "ease-in-out"

// Token: BACKGROUND_COLOR
export const BACKGROUND_COLOR_BASE = "hsla(0, 100%, 100%, 1)"
export const BACKGROUND_COLOR_ALTERNATE = "hsla(210, 10%, 96%, 1)"

// Token: BORDER_COLOR
export const BORDER_COLOR_BASE = "hsla(240, 9%, 91%, 1)"
export const BORDER_COLOR_HEAVY = "hsla(210, 8%, 58%, 1)"
export const BORDER_COLOR_HEAVIER = "hsla(210, 10%, 25%, 1)"

// Token: BORDER_RADIUS
export const BORDER_RADIUS_SMALLER = "2px"
export const BORDER_RADIUS_SMALL = "4px"
export const BORDER_RADIUS_BASE = "8px"
export const BORDER_RADIUS_LARGE = "16px"
export const BORDER_RADIUS_LARGER = "32px"

// Token: BORDER_WIDTH
export const BORDER_WIDTH_BASE = "1.5px"
export const BORDER_WIDTH_LARGE = "2px"

// Token: BOX_SHADOW
export const BOX_SHADOW_DOWN_BASE = "0 1px 4px hsla(0, 0%, 0%, 0.075)"
export const BOX_SHADOW_DOWN_LARGE = "0 2px 8px hsla(0, 0%, 0%, 0.1)"
export const BOX_SHADOW_UP_BASE = "0 -1px 4px hsla(0, 0%, 0%, 0.075)"
export const BOX_SHADOW_UP_LARGE = "0 -2px 8px hsla(0, 0%, 0%, 0.1)"

// Token: CELL_HEIGHT
export const CELL_HEIGHT_SMALLER = "24px"
export const CELL_HEIGHT_SMALL = "40px"
export const CELL_HEIGHT_BASE = "56px"
export const CELL_HEIGHT_LARGE = "64px"
export const CELL_HEIGHT_LARGER = "72px"

// Token: FOREGROUND_COLOR
export const FOREGROUND_COLOR_LIGHTER = "hsla(210, 5%, 80%, 1)"
export const FOREGROUND_COLOR_LIGHT = "hsla(210, 5%, 65%, 1)"
export const FOREGROUND_COLOR_MEDIUM = "hsla(210, 5%, 45%, 1)"
export const FOREGROUND_COLOR_HEAVY = "hsla(210, 5%, 25%, 1)"
export const FOREGROUND_COLOR_BASE = "hsla(210, 5%, 5%, 1)"
export const FOREGROUND_COLOR_DISABLED = "hsla(210, 5%, 5%, 0.6)"
export const FOREGROUND_COLOR_LINK = "hsla(202, 100%, 50%, 1)"
export const FOREGROUND_COLOR_SUCCESS = "hsla(146, 68%, 44%, 1)"
export const FOREGROUND_COLOR_WARNING = "hsla(29, 98%, 62%, 1)"
export const FOREGROUND_COLOR_ERROR = "hsla(10, 92%, 63%, 1)"

// Token: FONT_FAMILY
export const FONT_FAMILY_BASE = "\"Google Sans Flex\", sans-serif"
export const FONT_FAMILY_CODE = "\"Roboto Mono\", \"Courier New\", serif"
export const FONT_FAMILY_HEADING = "\"Google Sans Flex\", sans-serif"

// Token: FONT_SIZE
export const FONT_SIZE_SMALLER = "12px"
export const FONT_SIZE_SMALL = "14px"
export const FONT_SIZE_BASE = "16px"
export const FONT_SIZE_LARGE = "24px"
export const FONT_SIZE_LARGER = "32px"

// Token: FONT_WEIGHT
export const FONT_WEIGHT_LIGHT = "300"
export const FONT_WEIGHT_BASE = "400"
export const FONT_WEIGHT_MEDIUM = "500"
export const FONT_WEIGHT_SEMIBOLD = "600"
export const FONT_WEIGHT_BOLD = "700"
export const FONT_WEIGHT_EXTRABOLD = "800"
export const FONT_WEIGHT_BLACK = "900"

// Token: GAP
export const GAP_SMALLER = "4px"
export const GAP_SMALL = "8px"
export const GAP_BASE = "16px"
export const GAP_LARGE = "32px"
export const GAP_LARGER = "48px"

// Token: LINE_HEIGHT
export const LINE_HEIGHT_CONDENSED = "1.25"
export const LINE_HEIGHT_BASE = "1.5"
export const LINE_HEIGHT_EXPANDED = "1.75"