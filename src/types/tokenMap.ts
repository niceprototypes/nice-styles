/**
 * Token map shapes accepted by `setTokens` / `generateTokenCSS`.
 */

import type { BreakpointValue, ThemeValue } from './styleValues.js'

/** Variant → value mapping for one token group. */
export type TokenDefinition = Record<string, string | number>

/** camelCase token group name (kebab-cased in CSS) → its variants. */
export type TokenMap = Record<string, TokenDefinition>

/**
 * Recursive node of a nested component token tree.
 * A string leaf is a value; an object is a branch to descend.
 */
export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }

/** Any value a variant may hold at runtime: plain, per-theme, or per-breakpoint. */
export type RuntimeTokenValue = string | number | ThemeValue | BreakpointValue

/** A node under a runtime token map key: a variant's value, or a nested group of nodes. */
export type RuntimeTokenNode = RuntimeTokenValue | { [key: string]: RuntimeTokenNode }

/**
 * A runtime token map: each key is a group of variants, or a component prefix holding that
 * component's groups at any depth (`{ button: { icon: { color: { hover: { day: "red" } } } } }`).
 */
export type RuntimeTokenMap = Record<string, Record<string, RuntimeTokenNode>>
