import { DEFAULT_THEME, type StyleValueKind } from '../constants/styleValues.js'
import { isBreakpointKeyMap } from './breakpointKeyMap.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

/** The value type each style-value kind narrows to. */
interface StyleValueByKind {
  /** `{ day, night, … }` */
  theme: ThemeValue
  /** `{ phone, "laptop+", … }` */
  breakpoint: BreakpointValue
}

/**
 * Check if a value is a style-value object of the given kind. The single value
 * classifier for the registry, getters, and CSS generation.
 *
 * - `breakpoint`: a non-empty plain object whose every key is a breakpoint key —
 *   bare (`phone`) or with a range modifier (`laptop+`, `tablet-`).
 * - `theme`: a plain object that is not a breakpoint map and defines the
 *   default theme key (`day`).
 *
 * The two kinds are mutually exclusive, so check order does not matter.
 *
 * @example isStyleValue("theme", { day: "#000", night: "#fff" })  // true
 * @example isStyleValue("breakpoint", { phone: "16px" })           // true
 * @example isStyleValue("theme", "16px")                           // false
 *
 * @param kind - `theme` or `breakpoint`
 * @param value - Any value
 * @returns true when `value` is that kind (and narrows its type)
 */
export function isStyleValue<K extends StyleValueKind>(
  kind: K,
  value: unknown
): value is StyleValueByKind[K] {
  if (kind === 'breakpoint') return isBreakpointKeyMap(value)
  // Theme: a plain object carrying the default theme key, excluding breakpoint maps
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isBreakpointKeyMap(value) &&
    typeof (value as Record<string, unknown>)[DEFAULT_THEME] !== 'undefined'
  )
}
