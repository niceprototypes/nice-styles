import { BREAKPOINT_PHONE, BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP } from './breakpoints.js'

/** Default mode string value. */
export const DEFAULT_MODE = "day"

/** Default breakpoint string value — phone-first, so phone is the base. */
export const DEFAULT_BREAKPOINT = BREAKPOINT_PHONE

/**
 * Valid keys per style-value kind. The first entry is the discriminator
 * (default key) — its presence on a value identifies the value as belonging
 * to this kind.
 */
export const STYLE_VALUE_KEYS = {
  mode: [DEFAULT_MODE, "night"],
  breakpoint: [DEFAULT_BREAKPOINT, BREAKPOINT_TABLET, BREAKPOINT_LAPTOP, BREAKPOINT_DESKTOP],
} as const

export type StyleValueKind = keyof typeof STYLE_VALUE_KEYS
