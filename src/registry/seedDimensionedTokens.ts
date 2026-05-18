import type { ModeValue, BreakpointValue } from '../types/styleValues.js'
import type { RegistryEntry } from './createRegistry.js'

/**
 * Configuration for one dimensioned token module.
 *
 * - `data` is shaped { [dim]: { [tokenName]: { [variant]: cssValue } } } where
 *   `dim` is a mode (day/night) for color tokens or a breakpoint
 *   (phone/tablet/laptop) for size tokens.
 * - `defaultDim` defines the variant set used to enumerate registry entries.
 * - `modesForEntry` is what's recorded on each registry entry's `modes` Set;
 *   color modules pass their full mode set, size modules pass DEFAULT_MODE only
 *   because breakpoints are not modes.
 */
export interface DimensionedTokenSeed {
  data: Record<string, Record<string, Record<string, string>>>
  defaultDim: string
  modesForEntry: Set<string>
}

/**
 * Seed the registry from one or more dimensioned token modules. The variant set
 * for each token comes from its default dimension; values at other dimensions
 * are folded into a single ModeValue / BreakpointValue object so consumers can
 * resolve any dimension from one entry. Sparse cells (variant defined in the
 * default but absent in another dimension) are simply omitted from the result.
 */
export function seedDimensionedTokens(
  registry: Map<string, RegistryEntry>,
  seeds: DimensionedTokenSeed[],
): void {
  for (const { data, defaultDim, modesForEntry } of seeds) {
    const defaultTokens = data[defaultDim] ?? {}
    const dimensions = Object.keys(data)

    for (const tokenName of Object.keys(defaultTokens)) {
      const variants: Record<string, Record<string, string>> = {}

      for (const variantName of Object.keys(defaultTokens[tokenName])) {
        const dimValue: Record<string, string> = {}
        for (const dim of dimensions) {
          const value = data[dim]?.[tokenName]?.[variantName]
          if (value !== undefined) dimValue[dim] = value
        }
        variants[variantName] = dimValue
      }

      registry.set(tokenName, {
        variants: variants as Record<string, ModeValue | BreakpointValue>,
        modes: modesForEntry,
      })
    }
  }
}
