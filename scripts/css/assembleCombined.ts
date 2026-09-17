/**
 * Combined CSS assembler — `dist/tokens.css`.
 *
 * Orders the output of every emitter in `src/utilities/css/` into one file. No
 * lines are built here; each section comes from one emitter.
 *
 * ## Output
 * ```css
 * :root {
 *   color-scheme: light dark;
 *   --np--{group}--{variant}: {value};                  core semantic vars, blank line between groups
 *   /* Inverse colors *\/                              --inverse semantic vars
 *   /* Day mode primitives *\/                         core + inverse --day
 *   /* Night mode primitives *\/                       core + inverse --night
 *   /* {prefix} component tokens *\/                   component semantic vars, per prefix
 *   /* Component inverse colors *\/                    derived component --inverse vars
 *   /* Component day mode primitives *\/
 *   /* Component night mode primitives *\/
 *   /* Breakpoint primitives *\/                       --phone / --tablet / --laptop / --desktop
 *   /* Component breakpoint primitives *\/
 *   /* Extra theme primitives *\/                      --{theme}
 *   /* Component extra theme primitives *\/
 * }
 * @media (min-width: …) { :root { … } }                core, component, then alias breakpoint blocks
 * @media (prefers-color-scheme: dark) { :root { … } }  night reassignments
 * [data-theme="day"] { … }  [data-theme="night"] { … }  pins
 * [data-theme="{theme}"] { … }                         extra theme pins: core, component, alias
 * ```
 *
 * Night reassignments are merged from core, inverse, component, and alias
 * emitters into one theme block set, in that order.
 */

import { camelToKebab } from '../../src/utilities/camelToKebab.js'
import { getConstantKey } from '../../src/services/getConstant.js'
import { declarationLine } from '../../src/utilities/css/declarations.js'
import { themeBlocks } from '../../src/utilities/css/blocks.js'
import { generateTokenGroupCss } from '../../src/utilities/css/coreTokenCss.js'
import { generateComponentTokenCss } from '../../src/utilities/css/componentTokenCss.js'
import { buildCoreInverseMap, generateComponentInverseCss } from '../../src/utilities/css/componentInverseCss.js'
import { generateBreakpointTokenCss } from '../../src/utilities/css/breakpointTokenCss.js'
import { generateComponentBreakpointCss } from '../../src/utilities/css/componentBreakpointTokenCss.js'
import { generateExtraThemeCss, generateComponentExtraThemeCss } from '../../src/utilities/css/extraThemeTokenCss.js'
import { buildCoreScopeMap, generateComponentAliasCss } from '../../src/utilities/css/componentAliasCss.js'
import type { CssEmitResult, TokenTree } from '../../src/utilities/css/types.js'
import type { Tokens, NightTokens, ComponentTokens, ComponentBreakpointTokens, BreakpointTokens } from '../shared/types.js'

/** Blank line, header comment, body — nothing when the body is empty. */
function section(header: string, body: string[]): string[] {
  return body.length === 0 ? [] : ['', header, ...body]
}

/**
 * @param tokens - Core day/base groups
 * @param nightTokens - Core `$themes.night` overrides
 * @param componentTokens - Component base trees keyed by prefix
 * @param componentNightTokens - Component `$themes.night` trees keyed by prefix
 * @param breakpointTokens - Core `$breakpoints` keyed by breakpoint
 * @param componentBreakpointTokens - Component `$breakpoints` trees keyed by prefix, then breakpoint
 * @param extraThemes - Core non-night themes keyed by theme
 * @param componentExtraThemes - Component non-night theme trees keyed by prefix, then theme
 * @param inverseTokens - Core `$inverse` day values
 * @param inverseNightTokens - Core `$inverse` night values
 * @returns The file contents
 */
export function buildCombinedCss(
  tokens: Tokens,
  nightTokens: NightTokens,
  componentTokens: ComponentTokens,
  componentNightTokens: ComponentTokens,
  breakpointTokens: BreakpointTokens,
  componentBreakpointTokens: ComponentBreakpointTokens,
  extraThemes: Record<string, Tokens>,
  componentExtraThemes: Record<string, Record<string, TokenTree>>,
  inverseTokens: Tokens = {},
  inverseNightTokens: NightTokens = {},
  thresholds: Record<string, number> = {}
): { css: string } {
  // ── Emit ─────────────────────────────────────────────────────────────────
  // Every emitter runs once here; the assembly below only places its arrays.

  // Core groups — one result per group (not merged), so the assembly can put
  // a blank line between each group's semantic declarations. A group without
  // night overrides gets `{}` and emits semantic lines only.
  const core = Object.keys(tokens).map((group) =>
    generateTokenGroupCss(camelToKebab(group), tokens[group], nightTokens[group] || {})
  )

  // Inverse groups — same emitter with `inverse: true`, which appends the
  // `--inverse` segment to every variable (`--np--color--inverse`, `…--night--inverse`).
  const inverse = Object.keys(inverseTokens).map((group) =>
    generateTokenGroupCss(camelToKebab(group), inverseTokens[group], inverseNightTokens[group] || {}, true)
  )

  // Component trees — semantic lines for every leaf (grouped per prefix with a
  // header), plus day/night primitives for leaves with a `$themes.night` override.
  const component = generateComponentTokenCss(componentTokens, componentNightTokens)

  // Component inverse — a component color token is a bare alias to a core color,
  // and `--inverse` is a name suffix rather than a scope, so nothing propagates
  // into it on its own. Each alias to a core color that has an inverse gets a
  // parallel `--inverse` variable pointing at that core inverse; derived here,
  // never authored in the component files.
  const componentInverse = generateComponentInverseCss(
    componentTokens,
    buildCoreInverseMap(inverseTokens, inverseNightTokens)
  )

  // Component aliases — a component token whose value is exactly `var(--np--<core>)`
  // must follow the core token into every scope the core changes in (night,
  // breakpoints, extra themes). The scope map records, per core variable, which
  // of those scopes it has primitives in; authored component overrides win and
  // suppress the alias line for that path + scope.
  const alias = generateComponentAliasCss(
    componentTokens, componentNightTokens, componentBreakpointTokens, componentExtraThemes,
    buildCoreScopeMap(nightTokens, breakpointTokens, extraThemes)
  )

  // Breakpoint axis — primitives for inside `:root` and `min-width` blocks for
  // after it, for flat groups and for component trees respectively.
  const breakpoint = generateBreakpointTokenCss(breakpointTokens)
  const componentBreakpoint = generateComponentBreakpointCss(componentTokens, componentBreakpointTokens)

  // Extra themes (every theme except night) — primitives for inside `:root` and
  // one `[data-theme="{name}"]` pin block per theme for after it.
  const extraTheme = generateExtraThemeCss(extraThemes)
  const componentExtraTheme = generateComponentExtraThemeCss(componentExtraThemes)

  // Breakpoint floors as custom properties, so `getToken("breakpoints:laptop")`
  // resolves in CSS too (media queries cannot read custom properties, but
  // `calc()` and width rules can)
  const thresholdLines = Object.entries(thresholds).map(([name, px]) =>
    declarationLine(getConstantKey(`breakpoints:${name}`), `${px}px`)
  )

  // Core and inverse results share the day/night primitive sections and the
  // theme blocks, so they are read together.
  const coreAndInverse = [...core, ...inverse]
  // Concatenate one field across several group results, in group order.
  const collect = (results: CssEmitResult[], field: keyof CssEmitResult) => results.flatMap((result) => result[field])

  // ── Assemble ─────────────────────────────────────────────────────────────
  // Order matters twice: inside `:root` it groups the output for readers; after
  // `:root` it is the cascade — later blocks win at equal specificity.
  const lines = [
    // :root — every declaration that does not depend on a media query or theme pin
    ':root {',
    // Declare support for both schemes — enables native browser dark mode awareness
    '\tcolor-scheme: light dark;',
    '',

    // Semantic variables: core groups (blank line between groups), then inverse groups
    ...core.flatMap((group, i) => (i === 0 ? group.semanticLines : ['', ...group.semanticLines])),
    ...(inverse.length > 0 ? ['', '\t/* Inverse colors */', ...collect(inverse, 'semanticLines')] : []),

    // Core + inverse day/night primitives — stable values the theme blocks point at
    ...section('\t/* Day mode primitives */', collect(coreAndInverse, 'dayPrimitives')),
    ...section('\t/* Night mode primitives */', collect(coreAndInverse, 'nightPrimitives')),

    // Component semantic variables (with per-prefix headers), then their day/night primitives
    ...component.semanticLines,
    ...section('\t/* Component inverse colors */', componentInverse.semanticLines),
    ...section('\t/* Component day mode primitives */', component.dayPrimitives),
    ...section('\t/* Component night mode primitives */', component.nightPrimitives),

    // Breakpoint and extra-theme primitives — each emitter adds its own header when non-empty
    ...section('\t/* Breakpoint thresholds */', thresholdLines),
    ...breakpoint.primitiveLines,
    ...componentBreakpoint.primitiveLines,
    ...extraTheme.primitiveLines,
    ...componentExtraTheme.primitiveLines,
    '}',

    // Breakpoint blocks — core, then component, then alias. Each list ascends by
    // min-width so wider breakpoints win; alias blocks come last because an alias
    // line only exists where no authored component override does, so they never
    // conflict with the component blocks.
    ...breakpoint.mediaBlocks,
    ...componentBreakpoint.mediaBlocks,
    ...alias.bpMediaBlocks,

    // Day/night switching — one prefers-color-scheme block and the day/night pins,
    // after the breakpoint blocks so a theme reassignment wins over a breakpoint one.
    // Night bodies and day bodies are merged in the same order so the pins mirror each other.
    ...themeBlocks(
      [...collect(coreAndInverse, 'nightMediaBody'), ...component.nightMediaBody, ...componentInverse.nightMediaBody, ...alias.nightMediaBody],
      [...collect(coreAndInverse, 'dayPinBody'), ...component.dayPinBody, ...componentInverse.dayPinBody, ...alias.dayPinBody]
    ),

    // Extra theme pins — after the prefers-color-scheme block, whose `:root` rule
    // has the same specificity as `[data-theme]`, so on the root element the
    // explicit pin wins by source order
    ...extraTheme.pinBlocks,
    ...componentExtraTheme.pinBlocks,
    ...alias.extraPinBlocks,
  ]

  return { css: lines.join('\n') }
}
