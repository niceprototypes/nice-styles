import type { TokenMap } from '../separateTokens.js'

/**
 * Resolves a single token reference ("group.item") to its raw value string.
 *
 * Throws with a descriptive message when the syntax is wrong or the path
 * does not exist in the static map — every derived expression must reference
 * a real, already-resolved token.
 */
export function resolveReference(ref: string, staticTokens: TokenMap): string {
  const parts = ref.split('.')
  if (parts.length !== 2) {
    throw new Error(`Invalid token reference "${ref}". Expected "group.item" format.`)
  }
  const [group, item] = parts
  const groupTokens = staticTokens[group]
  if (!groupTokens) {
    throw new Error(`Derived token references unknown group "${group}".`)
  }
  const value = groupTokens[item]
  if (value === undefined) {
    throw new Error(`Derived token references unknown item "${group}.${item}".`)
  }
  return value
}
