import tokens from '../tokens.json' with { type: 'json' }
import { camelToScreaming } from '../utilities/camelToScreaming.js'

/**
 * Get JS constant name and value
 * @param group - Token group name (e.g., "fontSize")
 * @param item - Item name (e.g., "base") or null for all items
 * @returns Object with key and value
 *
 * @example
 * getJsConstant("fontSize", "base") // { key: "FONT_SIZE_BASE", value: "16px" }
 */
export const getJsConstant = (
  group: keyof typeof tokens,
  item: string | null
): { key: string; value: string } | null => {
  const tokenGroup = tokens[group]
  if (!tokenGroup) return null

  if (item === null) {
    throw new Error('Item name is required for getJsConstant')
  }

  const value = tokenGroup.items[item as keyof typeof tokenGroup.items]
  if (value === undefined) return null

  const groupScreaming = camelToScreaming(group)
  const itemScreaming = camelToScreaming(item)
  const key = `${groupScreaming}_${itemScreaming}`

  return { key, value: String(value) }
}