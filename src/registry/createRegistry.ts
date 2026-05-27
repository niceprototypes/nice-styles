import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'

/**
 * Registry entry storing token variants and their CSS prefix.
 */
export interface RegistryEntry {
  prefix?: string
  variants: Record<string, string | number | ThemeValue | BreakpointValue>
  themes: Set<string>
}

/**
 * Unified token registry — stores all registered tokens (core + custom).
 * Internal module-level singleton; mutated only by `registerTokens` and the
 * seed routines in this folder. The seed runs at module-evaluation time from
 * `./index.ts`.
 */
export const registry = new Map<string, RegistryEntry>()