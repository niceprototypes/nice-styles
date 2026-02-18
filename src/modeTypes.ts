/**
 * Mode Type Definitions
 *
 * System-level types for mode resolution.
 */

/**
 * ModeType
 *
 * Theme mode for pinning token resolution to a specific mode
 * instead of responding to the prefers-color-scheme media query.
 *
 * Built-in values:
 * - "day": Force day/light mode tokens
 * - "night": Force night/dark mode tokens
 *
 * Consumers may define additional custom modes.
 */
export type ModeType = "day" | "night" | (string & {})