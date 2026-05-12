/**
 * Separates a flat token map into static values and derived expressions.
 *
 * Static values are literal CSS values (e.g., "16px", "hsla(...)").
 * Derived values are prefixed with "=" and reference other tokens
 * (e.g., "= gap.base * 3").
 */

export type TokenMap = Record<string, Record<string, string>>

export interface SeparatedTokens {
  static: TokenMap
  derived: TokenMap
}

export function separateTokens(tokens: TokenMap): SeparatedTokens {
  const staticTokens: TokenMap = {}
  const derivedTokens: TokenMap = {}

  for (const group of Object.keys(tokens)) {
    const items = tokens[group]
    for (const item of Object.keys(items)) {
      const value = items[item]
      if (value.startsWith('=')) {
        if (!derivedTokens[group]) derivedTokens[group] = {}
        derivedTokens[group][item] = value
      } else {
        if (!staticTokens[group]) staticTokens[group] = {}
        staticTokens[group][item] = value
      }
    }
  }

  return { static: staticTokens, derived: derivedTokens }
}
