/**
 * Override validation — every override must address a base value that exists.
 *
 * Called once per build stage by `scripts/shared/readTokenSources.ts`, before
 * any file is written. An override without a base would emit a primitive and a
 * reassignment for a semantic variable that is never declared, so these
 * functions throw instead.
 *
 * | Function | Checks |
 * |---|---|
 * | `validateNightTokens` | Flat overrides (night, inverse night, extra themes) against their base groups; messages from `src/errors.json` |
 * | `validateComponentNightTokens` | Component theme trees (night and extra themes) against the component base tree |
 * | `validateComponentBreakpointTokens` | Component `$breakpoints` trees against the component base tree |
 */

import type { Tokens, NightTokens, ComponentTokens, ComponentBreakpointTokens, TokenNode, Errors } from '../shared/types.js'

/**
 * Fill an error template from `src/errors.json`.
 *
 * @param errors - Templates keyed by error name
 * @param key - Template name (e.g. `nightTokenGroupNotFound`)
 * @param values - Replacement for each `{placeholder}` in the template
 * @returns The filled message, or `Unknown error: {key}` when the template is missing
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
 *
 * @param errors - Templates keyed by error name
 * @param key - Template name
 * @param values - Placeholder replacements
 * @throws Always — an `Error` with the filled message
 */
function throwError(errors: Errors, key: string, values: Record<string, string>): never {
  throw new Error(formatError(errors, key, values))
}

/**
 * Throw when an override group has no matching base group.
 *
 * @param tokenName - Group name from the override (e.g. `color`)
 * @param defaultTokens - Base groups the override must address
 * @param errors - Templates from `src/errors.json`
 * @throws `nightTokenGroupNotFound`, listing the available groups
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
 * Throw when an override variant has no matching base variant within the same group.
 * Call after `assertGroupExists` — it indexes into `defaultTokens[tokenName]`.
 *
 * @param tokenName - Group name
 * @param variantName - Variant name from the override (e.g. `light`)
 * @param defaultTokens - Base groups the override must address
 * @param errors - Templates from `src/errors.json`
 * @throws `nightTokenVariantNotFound`, listing the group's available variants
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
 * Validate a flat override set against its base groups. Used for `$themes.night`,
 * `$inverse` night values, and every extra theme — the name reflects its first use.
 *
 * @param defaultTokens - Base groups (`themes.day`, or `inverse.day`)
 * @param nightTokens - Override groups to check
 * @param errors - Templates from `src/errors.json`
 * @throws on the first group or variant without a base
 */
export function validateNightTokens(
  defaultTokens: Tokens,
  nightTokens: NightTokens,
  errors: Errors
): void {
  for (const [tokenName, variants] of Object.entries(nightTokens)) {
    // Group first: the variant check reads inside the base group
    assertGroupExists(tokenName, defaultTokens, errors)
    for (const variantName of Object.keys(variants)) {
      assertVariantExists(tokenName, variantName, defaultTokens, errors)
    }
  }
}

/**
 * Throw when a component override key has no matching key in the base tree.
 *
 * @param fullPath - Path to the key, for the message (starts with the prefix)
 * @param dayNode - Base branch the key was looked up in, for the "Available" list
 * @param dayValue - Base value at the key; undefined when missing
 * @throws when `dayValue` is undefined
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
 * Throw when the override has a branch where the base has a leaf. Only called
 * for override branches; an override leaf over a base branch is not checked here.
 *
 * @param fullPath - Path to the key, for the message
 * @param dayValue - Base value at the same path
 * @throws when `dayValue` is not an object
 */
function assertBranchShapeMatches(fullPath: string[], dayValue: TokenNode): void {
  const isBranch = typeof dayValue === 'object' && dayValue !== null && typeof dayValue !== 'string'
  if (isBranch) return
  throw new Error(
    `Build error: Component night mode defines nested object at "${fullPath.join('.')}" but day has a leaf value.`
  )
}

/**
 * Throw when an override names a component prefix that has no base tree.
 * Shared by the theme and breakpoint validators.
 *
 * @param prefix - Component prefix from the override set
 * @param componentTokens - Component base trees keyed by prefix
 * @throws when `componentTokens[prefix]` is missing
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
 * Validate component theme override trees against the component base trees.
 * Used for `$themes.night` and, one theme at a time, for every extra theme.
 *
 * @param componentTokens - Component base trees keyed by prefix
 * @param componentNightTokens - Override trees keyed by prefix
 * @throws on the first prefix, path, or branch shape without a base
 */
export function validateComponentNightTokens(
  componentTokens: ComponentTokens,
  componentNightTokens: ComponentTokens
): void {
  /**
   * Walk the override tree in lockstep with the base tree.
   *
   * @param dayNode - Base branch at `path`
   * @param nightNode - Override branch at `path`
   * @param path - Keys walked so far; used only in error messages
   */
  function validateRecursive(
    dayNode: { [key: string]: TokenNode },
    nightNode: { [key: string]: TokenNode },
    path: string[]
  ): void {
    for (const [key, nightValue] of Object.entries(nightNode)) {
      const fullPath = [...path, key]
      const dayValue = dayNode[key]

      // Every override key must exist in the base at the same depth
      assertNightPathExists(fullPath, dayNode, dayValue)

      // Night is a branch — day must also be a branch at the same path; then descend.
      // A night leaf needs no further check at this path.
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
 * Breakpoint names themselves are not checked here.
 *
 * @param componentTokens - Component base trees keyed by prefix
 * @param componentBreakpointTokens - `$breakpoints` trees keyed by prefix, then breakpoint
 * @throws on the first prefix, path, or branch shape without a base
 */
export function validateComponentBreakpointTokens(
  componentTokens: ComponentTokens,
  componentBreakpointTokens: ComponentBreakpointTokens
): void {
  /**
   * Walk one breakpoint's override tree in lockstep with the base tree.
   *
   * @param dayNode - Base branch at `path`
   * @param bpNode - Override branch at `path`
   * @param path - Keys walked so far; used only in error messages
   */
  function validateRecursive(
    dayNode: { [key: string]: TokenNode },
    bpNode: { [key: string]: TokenNode },
    path: string[]
  ): void {
    for (const [key, bpValue] of Object.entries(bpNode)) {
      const fullPath = [...path, key]
      const dayValue = dayNode[key]

      // Every override key must exist in the base at the same depth
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

  // Each breakpoint tree is checked separately against the same base tree; the
  // `$breakpoints.{bp}` path segment only labels error messages
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
