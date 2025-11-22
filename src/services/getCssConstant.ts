import tokens from '../tokens.json' with { type: 'json' }
import { camelToKebab } from '../utilities/camelToKebab.js'

/**
 * Get CSS constant (variable or value)
 * @param group - Token group name (e.g., "fontSize")
 * @param item - Item name (e.g., "base") or null for all items
 * @param isVar - Whether to return CSS variable format or raw value
 * @returns Object with key and value
 *
 * @example
 * getCssConstant("fontSize", "base", true)  // { key: "var(--font-size-base)", value: "16px" }
 * getCssConstant("fontSize", "base", false) // { key: "--font-size-base", value: "16px" }
 */
export const getCssConstant = (
  group: keyof typeof tokens,
  item: string | null,
  isVar: boolean = false
): { key: string; value: string } | null => {
  const tokenGroup = tokens[group]
  if (!tokenGroup) return null

  if (item === null) {
    throw new Error('Item name is required for getCssConstant')
  }

  const value = tokenGroup.items[item as keyof typeof tokenGroup.items]
  if (value === undefined) return null

  const cssVarName = `--${tokenGroup.name}-${camelToKebab(item)}`
  const key = isVar ? `var(${cssVarName})` : cssVarName

  return { key, value: String(value) }
}