import type { ThemeValue, BreakpointValue } from '../types/styleValues.js'
import type { RegistryEntry } from './createRegistry.js'

/**
 * Configuration for one dimensioned token module.
 *
 * - `data` is shaped { [dim]: { [tokenName]: { [variant]: cssValue } } } where
 *   `dim` is a theme (day/night) for theme tokens or a breakpoint
 *   (phone/tablet/laptop) for breakpoint tokens.
 * - `defaultDim` defines the variant set used to enumerate registry entries.
 * - `themesForEntry` is what's recorded on each registry entry's `themes` Set;
 *   theme modules pass their full theme set, breakpoint modules pass DEFAULT_THEME only
 *   because breakpoints are not themes.
 */
export interface DimensionedTokenSeed {
  data: Record<string, Record<string, Record<string, string>>>
  defaultDim: string
  themesForEntry: Set<string>
}

/**
 * Seed the registry from one or more dimensioned token modules. The variant set
 * for each token comes from its default dimension; values at other dimensions
 * are folded into a single ThemeValue / BreakpointValue object so consumers can
 * resolve any dimension from one entry. Sparse cells (variant defined in the
 * default but absent in another dimension) are simply omitted from the result.
 */
export function seedDimensionedTokens(
  registry: Map<string, RegistryEntry>,
  seeds: DimensionedTokenSeed[],
): void {
  for (const { data, defaultDim, themesForEntry } of seeds) {
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
        variants: variants as Record<string, ThemeValue | BreakpointValue>,
        themes: themesForEntry,
      })
    }
  }
}