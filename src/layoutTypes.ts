/**
 * Layout Type Definitions
 *
 * Derived types for layout components that use design tokens.
 * These types build on top of the auto-generated token types.
 */

import type { GapType } from "./types.js"
import type { BreakpointName } from "./services/getBreakpoint.js"

/**
 * SpacingShorthandType
 *
 * CSS-like shorthand string for spacing using token names.
 * Supports 1-4 space-separated token values following CSS padding/margin shorthand rules:
 * - 1 value: "small" → all sides
 * - 2 values: "small base" → top/bottom, left/right
 * - 3 values: "small base large" → top, left/right, bottom
 * - 4 values: "small base large smaller" → top, right, bottom, left
 */
type SpacingShorthand1 = GapType
type SpacingShorthand2 = `${GapType} ${GapType}`
type SpacingShorthand3 = `${GapType} ${GapType} ${GapType}`
type SpacingShorthand4 = `${GapType} ${GapType} ${GapType} ${GapType}`

export type SpacingShorthandType = SpacingShorthand1 | SpacingShorthand2 | SpacingShorthand3 | SpacingShorthand4

/**
 * SpacingDefinitionType
 *
 * Parsed spacing values with individual sides.
 * This is the result after parsing a SpacingShorthandType.
 */
export type SpacingDefinitionType = {
  top?: GapType
  right?: GapType
  bottom?: GapType
  left?: GapType
}

/**
 * SpacingResponsiveType
 *
 * Responsive spacing configuration where each breakpoint can have:
 * - A shorthand string (e.g., "small base")
 * - null to explicitly disable spacing at that breakpoint
 */
export type SpacingResponsiveType = {
  [K in BreakpointName]?: SpacingShorthandType | null
}

/**
 * SpacingType
 *
 * Union type for spacing, supporting two formats:
 * - Shorthand string: "small", "small base", etc. (applies to mobile breakpoint)
 * - Responsive object: { mobile: "base", tablet: null, desktop: "small large" }
 */
export type SpacingType = SpacingShorthandType | SpacingResponsiveType