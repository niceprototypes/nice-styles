import componentTokensData from '../componentTokensData.js'
import { getTokenFromMap, type TokenResult } from './getTokenFromMap.js'
import type { ComponentPrefix } from '../types.js'

/**
 * Get a component-scoped design token with CSS variable name and raw value.
 *
 * Looks up the token from the auto-generated component token data and
 * produces CSS variables namespaced to the component prefix:
 * `--np--{prefix}--{tokenName}--{variant}`
 *
 * @param prefix - Component prefix (e.g., "button", "icon", "tile", "typography")
 * @param tokenName - Token name within the component (e.g., "size", "spacing")
 * @param variant - Variant within token (defaults to "base")
 * @param mode - Optional theme mode suffix (e.g., "night", "light")
 * @returns { key, var, value } - CSS variable name, var() wrapped, raw value
 * @throws Error if prefix, token, or variant not found
 *
 * @example
 * getComponentToken("button", "size", "base")
 * // → { key: "--np--button--size--base", var: "var(--np--button--size--base)", value: "var(--np--cell-height--base)" }
 *
 * @example
 * getComponentToken("icon", "color", "error")
 * // → { key: "--np--icon--color--error", var: "var(--np--icon--color--error)", value: "var(--np--foreground-color--error)" }
 */
export function getComponentToken(
  prefix: ComponentPrefix,
  tokenName: string,
  variant = "base",
  mode?: string
): TokenResult {
  const componentData = componentTokensData[prefix]
  if (!componentData) {
    const available = Object.keys(componentTokensData).join(', ')
    throw new Error(`Component prefix "${prefix}" not found. Available prefixes: ${available}`)
  }

  return getTokenFromMap(componentData, tokenName, variant, { mode, prefix })
}