/**
 * Night token validation.
 *
 * Ensures every night override has a corresponding day default.
 * Runs at build time — throws on validation failure to prevent
 * generating CSS with orphan night tokens that have no semantic variable.
 */

import type { Tokens, NightTokens, ComponentTokens, ComponentBreakpointTokens, TokenNode, Errors } from './types.js'

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
 * Throw a templated error sourced from errors.json. Wraps formatError so call
 * sites read as one verb (`throwError(...)`) instead of `throw new Error(formatError(...))`.
 */
function throwError(errors: Errors, key: string, values: Record<string, string>): never {
  throw new Error(formatError(errors, key, values))
}

/**
 * Throw when a night token group has no matching day group.
 */
function assertGroupExists(
  tokenName: string,
  defaultTokens: Tokens,
  errors: Errors
): void {
  if (defaultTokens[tokenName]) return
  throwError(errors, "nightTokenGroupNotFound", {
    tokenName,
    available: Object.keys(defaultTokens).join(', ')
  })
}

/**
 * Throw when a night variant has no matching day variant within the same group.
 */
function assertVariantExists(
  tokenName: string,
  variantName: string,
  defaultTokens: Tokens,
  errors: Errors
): void {
  if (defaultTokens[tokenName][variantName]) return
  throwError(errors, "nightTokenVariantNotFound", {
    tokenName,
    variantName,
    available: Object.keys(defaultTokens[tokenName]).join(', ')
  })
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
    assertGroupExists(tokenName, defaultTokens, errors)
    for (const variantName of Object.keys(variants)) {
      assertVariantExists(tokenName, variantName, defaultTokens, errors)
    }
  }
}

/**
 * Throw when a component night node references a path not present in the day tree.
 */
function assertNightPathExists(
  fullPath: string[],
  dayNode: { [key: string]: TokenNode },
  dayValue: TokenNode | undefined
): void {
  if (dayValue !== undefined) return
  throw new Error(
    `Build error: Component night mode defines "${fullPath.join('.')}" but it doesn't exist in day tokens. Available: ${Object.keys(dayNode).join(', ')}`
  )
}

/**
 * Throw when night is a branch but day is a leaf (or vice-versa) at the same path.
 * Structural mismatches would produce nonsensical CSS later in the pipeline.
 */
function assertBranchShapeMatches(fullPath: string[], dayValue: TokenNode): void {
  const isBranch = typeof dayValue === 'object' && dayValue !== null && typeof dayValue !== 'string'
  if (isBranch) return
  throw new Error(
    `Build error: Component night mode defines nested object at "${fullPath.join('.')}" but day has a leaf value.`
  )
}

/**
 * Throw when a component night prefix has no matching day prefix.
 */
function assertComponentPrefixExists(
  prefix: string,
  componentTokens: ComponentTokens
): void {
  if (componentTokens[prefix]) return
  throw new Error(
    `Build error: Component night mode defines "${prefix}" but it doesn't exist in day component tokens. Available: ${Object.keys(componentTokens).join(', ')}`
  )
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

      assertNightPathExists(fullPath, dayNode, dayValue)

      // Night is a branch — day must also be a branch at the same path
      if (typeof nightValue === 'object' && nightValue !== null) {
        assertBranchShapeMatches(fullPath, dayValue as TokenNode)
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
    assertComponentPrefixExists(prefix, componentTokens)
    validateRecursive(
      componentTokens[prefix] as { [key: string]: TokenNode },
      nightTokenMap as { [key: string]: TokenNode },
      [prefix]
    )
  }
}

/**
 * Validates that every path in component breakpoint tokens exists in the
 * component day/base tree. The breakpoint-axis parallel of
 * validateComponentNightTokens — walks each `{ breakpoint: partialTree }`
 * override against the base, so an override can't reference a missing path.
 */
export function validateComponentBreakpointTokens(
  componentTokens: ComponentTokens,
  componentBreakpointTokens: ComponentBreakpointTokens
): void {
  function validateRecursive(
    dayNode: { [key: string]: TokenNode },
    bpNode: { [key: string]: TokenNode },
    path: string[]
  ): void {
    for (const [key, bpValue] of Object.entries(bpNode)) {
      const fullPath = [...path, key]
      const dayValue = dayNode[key]

      if (dayValue === undefined) {
        throw new Error(
          `Build error: Component breakpoint defines "${fullPath.join('.')}" but it doesn't exist in base tokens. Available: ${Object.keys(dayNode).join(', ')}`
        )
      }

      // Breakpoint is a branch — base must also be a branch at the same path
      if (typeof bpValue === 'object' && bpValue !== null) {
        const baseIsBranch = typeof dayValue === 'object' && dayValue !== null
        if (!baseIsBranch) {
          throw new Error(
            `Build error: Component breakpoint defines a nested object at "${fullPath.join('.')}" but base has a leaf value.`
          )
        }
        validateRecursive(
          dayValue as { [key: string]: TokenNode },
          bpValue as { [key: string]: TokenNode },
          fullPath
        )
      }
    }
  }

  for (const [prefix, bpMap] of Object.entries(componentBreakpointTokens)) {
    assertComponentPrefixExists(prefix, componentTokens)
    for (const [breakpoint, tree] of Object.entries(bpMap)) {
      validateRecursive(
        componentTokens[prefix] as { [key: string]: TokenNode },
        tree as { [key: string]: TokenNode },
        [prefix, `$breakpoints.${breakpoint}`]
      )
    }
  }
}
