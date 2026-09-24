/**
 * Auto-generated from src/tokens/modules/*.json, src/tokens/components/*.json — do not edit by hand.
 * Regenerate: npm run build:types
 */

export type AnimationDurationType = "faster" | "fast" | "base" | "slow" | "slower"
export type AnimationEasingType = "base" | "linear" | "ease-in" | "ease-out" | "ease"
export type BackgroundSizeType = "base" | "contain" | "cover" | "fill" | "none" | "scale-down"
export type BorderRadiusType = "none" | "smaller" | "small" | "base" | "large" | "larger"
export type BorderWidthType = "none" | "smaller" | "small" | "base" | "large" | "larger"
export type BoxShadowType = "base" | "large"
export type BrandColorType = "base" | "secondary"
export type FontFamilyType = "base" | "code" | "heading"
export type FontWeightType = "light" | "base" | "medium" | "semibold" | "bold" | "extrabold" | "black"
export type GapType = "none" | "smaller" | "small" | "base" | "large" | "larger"
export type LetterSpacingType = "tight" | "base" | "wide" | "wider"
export type LineHeightType = "single" | "condensed" | "base" | "expanded"
export type SizeType = "smaller" | "small" | "base" | "large" | "larger"
export type ZIndexType = "base" | "low" | "medium" | "high" | "higher"
export type BackgroundColorType = "base" | "raised" | "success" | "highlight" | "warning" | "error" | "link"
export type BorderColorType = "base" | "subtle" | "strong" | "stronger" | "success" | "highlight" | "warning" | "error" | "link"
export type ColorType = "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
export type FontSizeType = "smaller" | "small" | "base" | "large" | "larger"
export type BackgroundColorInverseType = "base" | "raised" | "success" | "highlight" | "warning" | "error" | "link"
export type BorderColorInverseType = "base" | "subtle" | "strong" | "stronger" | "success" | "highlight" | "warning" | "error" | "link"
export type ColorInverseType = "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"

export type ComponentPrefix = "button" | "calendar" | "code" | "field" | "icon" | "image" | "ink" | "input" | "lightbox" | "popover" | "select" | "tile"

/** Variant union of every token group, keyed by address group (`"fontSize"`, `"button.icon.size"`). */
export interface TokenVariants {
  "animationDuration": AnimationDurationType
  "animationEasing": AnimationEasingType
  "backgroundSize": BackgroundSizeType
  "borderRadius": BorderRadiusType
  "borderWidth": BorderWidthType
  "boxShadow": BoxShadowType
  "brandColor": BrandColorType
  "fontFamily": FontFamilyType
  "fontWeight": FontWeightType
  "gap": GapType
  "letterSpacing": LetterSpacingType
  "lineHeight": LineHeightType
  "size": SizeType
  "zIndex": ZIndexType
  "backgroundColor": BackgroundColorType
  "borderColor": BorderColorType
  "color": ColorType
  "fontSize": FontSizeType
  "breakpoints": "tablet" | "laptop" | "desktop"
  "button.size": "smaller" | "small" | "base" | "large" | "larger"
  "button.spacing": "smaller" | "small" | "base" | "large" | "larger"
  "button.borderRadius": "none" | "smaller" | "small" | "base" | "large" | "larger" | "rounded"
  "button.borderWidth": "none" | "smaller" | "small" | "base" | "large" | "larger"
  "button.borderColor": "base" | "subtle" | "strong" | "stronger" | "success" | "highlight" | "warning" | "error" | "link"
  "button.icon.color": "base"
  "button.icon.size": "smaller" | "small" | "base" | "large" | "larger"
  "calendar.cell.size": "smaller" | "small" | "base" | "large" | "larger"
  "calendar.gap": "base"
  "calendar.color": "base" | "today" | "selected" | "range" | "disabled"
  "calendar.backgroundColor": "base" | "selected" | "range"
  "calendar.borderColor": "today"
  "code.backgroundColor": "base"
  "code.borderColor": "base"
  "code.borderRadius": "base" | "small"
  "code.boxShadow": "base"
  "code.gap": "base"
  "code.fontFamily": "base" | "code"
  "code.fontSize": "smaller" | "small" | "base"
  "code.fontWeight": "semibold"
  "code.lineHeight": "base" | "expanded"
  "code.color": "base" | "lightest" | "link" | "highlight"
  "field.gap": "label" | "description" | "error"
  "icon.size": "smaller" | "small" | "base" | "large" | "larger"
  "icon.color": "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
  "icon.strokeWidth": "small" | "base" | "large"
  "icon.animationDuration": "fast" | "base" | "slow"
  "icon.viewBox": "base"
  "image.borderRadius": "none" | "smaller" | "small" | "base" | "large" | "larger"
  "image.borderWidth": "none" | "smaller" | "small" | "base" | "large" | "larger"
  "image.borderColor": "base" | "strong" | "stronger"
  "image.backgroundSize": "base" | "contain" | "cover" | "fill" | "none" | "scale-down"
  "image.objectFit": "base"
  "ink.fontSize": "smaller" | "small" | "base" | "large" | "larger"
  "ink.fontFamily": "base" | "code" | "heading"
  "ink.fontWeight": "light" | "base" | "medium" | "semibold" | "bold" | "extrabold" | "black"
  "ink.lineHeight": "condensed" | "base" | "expanded"
  "ink.letterSpacing": "tight" | "base" | "wide" | "wider"
  "ink.color": "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
  "ink.maxWidth": "prose" | "wide" | "full"
  "input.size": "smaller" | "small" | "base" | "large" | "larger"
  "input.spacing": "smaller" | "small" | "base" | "large" | "larger"
  "input.borderRadius": "none" | "smaller" | "small" | "base" | "large" | "larger"
  "input.borderWidth": "none" | "smaller" | "small" | "base" | "large" | "larger"
  "input.backgroundColor": "base" | "raised" | "success" | "highlight" | "warning" | "error" | "link"
  "input.borderColor": "base" | "subtle" | "strong" | "stronger" | "success" | "highlight" | "warning" | "error" | "link"
  "input.width": "2" | "3" | "4" | "5" | "10" | "20" | "full"
  "input.fontSize": "base"
  "input.focusRing.width": "base"
  "input.focusRing.color": "base"
  "input.focusRing.offset": "base"
  "lightbox.zIndex": "base"
  "popover.offset": "base"
  "popover.borderRadius": "base"
  "popover.boxShadow": "base"
  "popover.zIndex": "base"
  "popover.maxHeight": "base"
  "select.chevron.size": "smaller" | "small" | "base" | "large" | "larger"
  "tile.backgroundColor": "base" | "raised" | "success" | "warning" | "error" | "link"
  "tile.backgroundSize": "base" | "contain" | "cover" | "fill" | "none" | "scale-down"
  "tile.color": "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
}

/** Variant union of every token group that has the `:inverse` effect. */
export interface TokenInverseVariants {
  "backgroundColor": BackgroundColorInverseType
  "borderColor": BorderColorInverseType
  "color": ColorInverseType
  "button.borderColor": "base" | "subtle" | "strong" | "stronger" | "success" | "highlight" | "warning" | "error" | "link"
  "calendar.color": "base" | "today" | "selected" | "range" | "disabled"
  "calendar.backgroundColor": "base" | "selected" | "range"
  "calendar.borderColor": "today"
  "code.backgroundColor": "base"
  "code.borderColor": "base"
  "code.color": "base" | "lightest" | "link" | "highlight"
  "icon.color": "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
  "image.borderColor": "base" | "strong" | "stronger"
  "ink.color": "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
  "input.backgroundColor": "base" | "raised" | "success" | "highlight" | "warning" | "error" | "link"
  "input.borderColor": "base" | "subtle" | "strong" | "stronger" | "success" | "highlight" | "warning" | "error" | "link"
  "input.focusRing.color": "base"
  "tile.backgroundColor": "base" | "raised" | "success" | "warning" | "error" | "link"
  "tile.color": "base" | "light" | "lighter" | "lightest" | "disabled" | "link" | "success" | "highlight" | "warning" | "error"
}

/** Every token group an address or the two-argument `getToken` form can name. */
export type TokenGroup = keyof TokenVariants

/** Every valid token address: `group:variant`, bare `group` where the group has `base`, and `group:variant:inverse`. */
export type TokenAddress =
  | { [G in TokenGroup]: `${G}:${TokenVariants[G]}` | ("base" extends TokenVariants[G] ? G : never) }[TokenGroup]
  | { [G in keyof TokenInverseVariants]: `${G}:${TokenInverseVariants[G]}:inverse` }[keyof TokenInverseVariants]
