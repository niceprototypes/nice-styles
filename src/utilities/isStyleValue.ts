import { STYLE_VALUE_KEYS, type StyleValueKind } from '../constants/styleValues.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

interface StyleValueByKind {
  theme: ThemeValue
  breakpoint: BreakpointValue
}

/**
 * Check if a value is a style-value object of the given kind.
 *
 * Discriminates by the kind's default key (`"day"` for theme, `"phone"` for
 * breakpoint). When a value has both kinds' default keys, callers should
 * check `"breakpoint"` first.
 */
export function isStyleValue<K extends StyleValueKind>(
  kind: K,
  value: unknown
): value is StyleValueByKind[K] {
  const discriminator = STYLE_VALUE_KEYS[kind][0]
  return (
    typeof value === "object" &&
    value !== null &&
    discriminator in value &&
    typeof (value as Record<string, unknown>)[discriminator] !== "undefined"
  )
}
