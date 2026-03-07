/**
 * Night token validation.
 *
 * Ensures every night override has a corresponding day default.
 * Runs at build time — throws on validation failure to prevent
 * generating CSS with orphan night tokens that have no semantic variable.
 */

import type { Tokens, NightTokens, ComponentTokens, TokenNode, Errors } from './types.js'

/**
 * Replaces {placeholder} patterns in an error template with provided values.
 */
function formatError(errors: Errors, key: string, values: Record<string, string>): string {
  // Fall back to the key itself if no template exists in errors.json
  let message = errors[key] || `Unknown error: ${key}`
  // Replace each {placeholder} in the template with its corresponding value
  for (const [placeholder, value] of Object.entries(values)) {
    message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value)
  }
  return message
}

/**
 * Validates that every token group and variant in nightTokens exists in defaultTokens.
 * Throws with a descriptive error if a night token references a nonexistent default.
 */
export function validateNightTokens(
  defaultTokens: Tokens,
  nightTokens: NightTokens,
  errors: Errors
): void {
  for (const [tokenName, variants] of Object.entries(nightTokens)) {
    // Night must not define a token group that doesn't exist in day
    if (!defaultTokens[tokenName]) {
      throw new Error(
        formatError(errors, "nightTokenGroupNotFound", {
          tokenName,
          available: Object.keys(defaultTokens).join(', ')
        })
      )
    }

    // Each variant within the night group must also exist in the day group
    for (const variantName of Object.keys(variants)) {
      if (!defaultTokens[tokenName][variantName]) {
        throw new Error(
          formatError(errors, "nightTokenVariantNotFound", {
            tokenName,
            variantName,
            available: Object.keys(defaultTokens[tokenName]).join(', ')
          })
        )
      }
    }
  }
}

/**
 * Validates that every path in component night tokens exists in component day tokens.
 * Walks the tree recursively to support arbitrarily nested token structures.
 */
export function validateComponentNightTokens(
  componentTokens: ComponentTokens,
  componentNightTokens: ComponentTokens
): void {
  function validateRecursive(
    dayNode: { [key: string]: TokenNode },
    nightNode: { [key: string]: TokenNode },
    path: string[]
  ): void {
    for (const [key, nightValue] of Object.entries(nightNode)) {
      const fullPath = [...path, key]
      const dayValue = dayNode[key]

      // Night path must have a corresponding day path — orphan night tokens are a build error
      if (dayValue === undefined) {
        throw new Error(
          `Build error: Component night mode defines "${fullPath.join('.')}" but it doesn't exist in day tokens. Available: ${Object.keys(dayNode).join(', ')}`
        )
      }

      // Night is a branch — day must also be a branch at the same path (structural mismatch)
      if (typeof nightValue === 'object' && nightValue !== null) {
        if (typeof dayValue !== 'object' || dayValue === null || typeof dayValue === 'string') {
          throw new Error(
            `Build error: Component night mode defines nested object at "${fullPath.join('.')}" but day has a leaf value.`
          )
        }
        validateRecursive(
          dayValue as { [key: string]: TokenNode },
          nightValue as { [key: string]: TokenNode },
          fullPath
        )
      }
    }
  }

  // Validate each component prefix independently, seeding recursion with [prefix] as the path root
  for (const [prefix, nightTokenMap] of Object.entries(componentNightTokens)) {
    // Night must not define a component prefix that doesn't exist in day
    if (!componentTokens[prefix]) {
      throw new Error(
        `Build error: Component night mode defines "${prefix}" but it doesn't exist in day component tokens. Available: ${Object.keys(componentTokens).join(', ')}`
      )
    }
    validateRecursive(
      componentTokens[prefix] as { [key: string]: TokenNode },
      nightTokenMap as { [key: string]: TokenNode },
      [prefix]
    )
  }
}
