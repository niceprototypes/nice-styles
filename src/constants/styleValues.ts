import { BREAKPOINT_PHONE, BREAKPOINT_ORDER } from './breakpoints.js'

/** Default theme string value. */
export const DEFAULT_THEME = "day"

/** The theme mapped to `prefers-color-scheme: dark` and paired with the day pin. */
export const NIGHT_THEME = "night"

/** Default breakpoint string value — phone-first, so phone is the base. */
export const DEFAULT_BREAKPOINT = BREAKPOINT_PHONE

/**
 * Valid keys per style-value kind. The first entry is the discriminator
 * (default key) — its presence on a value identifies the value as belonging
 * to this kind.
 */
export const STYLE_VALUE_KEYS = {
  theme: [DEFAULT_THEME, "night"],
  breakpoint: BREAKPOINT_ORDER,
} as const

export type StyleValueKind = keyof typeof STYLE_VALUE_KEYS
