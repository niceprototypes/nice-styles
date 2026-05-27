/**
 * Theme Type Definitions
 *
 * System-level types for theme resolution.
 */

/**
 * ThemeType
 *
 * Theme name for pinning token resolution to a specific theme
 * instead of responding to the prefers-color-scheme media query.
 *
 * Built-in values:
 * - "day": Force day/light theme tokens
 * - "night": Force night/dark theme tokens
 *
 * Consumers may define additional custom themes.
 */
export type ThemeType = "day" | "night" | (string & {})
