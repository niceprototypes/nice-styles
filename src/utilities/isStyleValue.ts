import { DEFAULT_THEME, type StyleValueKind } from '../constants/styleValues.js'
import { isBreakpointKeyMap } from '../services/breakpointKey.js'
import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

interface StyleValueByKind {
  theme: ThemeValue
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
 */
export function isStyleValue<K extends StyleValueKind>(
  kind: K,
  value: unknown
): value is StyleValueByKind[K] {
  if (kind === 'breakpoint') return isBreakpointKeyMap(value)
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isBreakpointKeyMap(value) &&
    typeof (value as Record<string, unknown>)[DEFAULT_THEME] !== 'undefined'
  )
}
