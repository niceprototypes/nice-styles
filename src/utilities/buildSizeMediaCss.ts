/**
 * Build the @media cascade for size tokens as a self-contained CSS string.
 *
 * Used at runtime by `setBreakpoints` to re-emit the responsive cascade with
 * new pixel thresholds. The output mirrors what `scripts/css/emitSizeTokens.ts`
 * produces into `dist/variables.css` — same media body lines, same primitive
 * references — so the injected stylesheet overrides the build-time blocks
 * cleanly when later in source order.
 *
 * Primitives (`--*--phone`, `--*--laptop`, etc.) are NOT re-emitted here: they
 * already live in `:root` of `variables.css` and only their values would change
 * with new thresholds — but the values themselves are unaffected by threshold
 * shifts. Only the @media triggers move.
 */

import { camelToKebab } from './camelToKebab.js'
import { getConstant } from '../services/getConstant.js'
import {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointValues,
} from '../constants/breakpoints.js'
import type { DimensionMap } from '../store.js'

/**
 * Build one media-body line that reassigns the semantic var to a breakpoint primitive.
 */
function buildMediaLine(cssName: string, variant: string, breakpoint: string): string {
  const semantic = getConstant(cssName, variant).key
  const primitive = getConstant(cssName, variant, { breakpoint }).key
  return `\t\t${semantic}: var(${primitive});`
}

/**
 * Collect media-body lines for one override breakpoint across all groups/variants
 * that have an entry for it.
 */
function collectMediaLines(sizeData: DimensionMap, breakpoint: string): string[] {
  const lines: string[] = []
  const dimension = sizeData[breakpoint]
  if (!dimension) return lines

  for (const [group, variants] of Object.entries(dimension)) {
    const cssName = camelToKebab(group)
    for (const variant of Object.keys(variants)) {
      lines.push(buildMediaLine(cssName, variant, breakpoint))
    }
  }
  return lines
}

/**
 * Wrap media-body lines in a `@media (min-width: …) { :root { … } }` block.
 * Returns empty string when there are no lines.
 */
function wrapMediaBlock(minWidth: number, body: string[]): string {
  if (body.length === 0) return ''
  return `@media (min-width: ${minWidth}px) {\n\t:root {\n${body.join('\n')}\n\t}\n}`
}

/**
 * Build the full size-token @media cascade for the given size module data
 * and breakpoint thresholds.
 *
 * @param sizeData - Size module data keyed by breakpoint (phone/tablet/laptop/desktop)
 * @param breakpoints - Pixel thresholds to use for the @media queries
 */
export function buildSizeMediaCss(
  sizeData: DimensionMap,
  breakpoints: BreakpointValues
): string {
  const tabletBlock = wrapMediaBlock(
    breakpoints[BREAKPOINT_PHONE] + 1,
    collectMediaLines(sizeData, BREAKPOINT_TABLET)
  )
  const laptopBlock = wrapMediaBlock(
    breakpoints[BREAKPOINT_LAPTOP],
    collectMediaLines(sizeData, BREAKPOINT_LAPTOP)
  )
  const desktopBlock = wrapMediaBlock(
    breakpoints[BREAKPOINT_DESKTOP],
    collectMediaLines(sizeData, BREAKPOINT_DESKTOP)
  )

  return [tabletBlock, laptopBlock, desktopBlock].filter(Boolean).join('\n\n')
}
