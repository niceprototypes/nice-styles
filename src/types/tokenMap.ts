/**
 * Token map shapes accepted by `setTokens` / `generateTokenCSS`.
 */

/** Variant → value mapping for one token group. */
export type TokenDefinition = Record<string, string | number>

/** camelCase token group name (kebab-cased in CSS) → its variants. */
export type TokenMap = Record<string, TokenDefinition>

/**
 * Recursive node of a nested component token tree.
 * A string leaf is a value; an object is a branch to descend.
 */
export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }
