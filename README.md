# nice-styles

Design tokens for Nice Prototypes: JSON token sources compiled to CSS custom properties (`--np--…`), typed data, and one runtime store read through a single getter. Framework-agnostic; React bindings live in [nice-react-styles](../react-styles).

## Installation

```bash
npm install nice-styles
```

## CSS

```css
@import "nice-styles/tokens.css";

.card {
  padding: var(--np--gap);
  border-radius: var(--np--border-radius--small);
  color: var(--np--color);
  font-size: var(--np--font-size--large); /* responsive: changes per breakpoint */
}
```

`tokens.css` declares every token on `:root`, plus:

- **Themes** — themed tokens follow `prefers-color-scheme` and can be pinned with `[data-theme="day"]` / `[data-theme="night"]` (or any extra theme name) on any element.
- **Breakpoints** — responsive tokens are reassigned in `min-width` media blocks.
- **Stable primitives** — `--np--color--night`, `--np--font-size--large--laptop`, … hold one theme's or breakpoint's value and are never reassigned.

| Import | Contents |
|---|---|
| `nice-styles/tokens.css` | All tokens, theme switching, and breakpoint blocks |
| `nice-styles/css/{group}.css` | One group's variables and primitives, no theme switching (e.g. `css/gap.css`) |
| `nice-styles/breakpoints.css` | `.np-hide-{breakpoint}`, `-up`, `-down` utility classes |
| `nice-styles/breakpoints.custom-media.css` | Optional `@custom-media` aliases (`@media (--np--tablet--up)`); requires `postcss-custom-media` |
| `nice-styles/reset.css` | Token-driven reset (`reset.spacing.css`, `reset.colors.css`, `reset.borders.css`, `reset.responsive.css` individually) |

Every file except `breakpoints.custom-media.css` is plain CSS for a bare `@import`, with no build step in the consuming app.

## JavaScript

### Read a token — `getToken`

One getter for every token kind: core, custom, theme, breakpoint, inverse, and component.

```ts
import { getToken } from "nice-styles"

getToken("gap")                                            // "var(--np--gap)"
getToken("gap", "large")                                   // "var(--np--gap--large)"
getToken("gap", "base", { as: "key" })                     // "--np--gap"
getToken("gap", "base", { as: "value" })                   // "16px"
getToken("color", "base", { theme: "night" })              // "var(--np--color--night)"
getToken("fontSize", "large", { breakpoint: "laptop" })    // "var(--np--font-size--large--laptop)"
getToken("color", "base", { inverse: true })               // "var(--np--color--inverse)"
getToken("button.icon.size:small")                         // "var(--np--button--icon--size--small)"
```

| Option | Effect |
|---|---|
| `as` | `"var"` (default), `"key"` (bare variable name), or `"value"` (raw value) |
| `theme` | Pin to a theme primitive; throws if the token has no value for it |
| `breakpoint` | Pin to a breakpoint primitive (`var` / `key`) or resolve the value at that breakpoint (`value`) |
| `inverse` | The inverse-color dimension |
| `transform` | Adjust the colour's hsla channels — `var` returns a live `hsl(from …)` expression, `value` computes a literal |
| `pristine` | Read the generated value, ignoring runtime overrides |

### List tokens — `listTokens`

```ts
import { listTokens } from "nice-styles"

listTokens({ prefix: "button" })   // every button component token
listTokens({ group: "color" })     // color variants, base and inverse
listTokens({ source: "runtime" })  // tokens created at runtime only
// → [{ key, prefix, path, variant, inverse, themes, breakpoints, source }, …]
```

### Set tokens at runtime — `generateTokenCSS`

```ts
import { generateTokenCSS, injectTokenCSS } from "nice-styles"

injectTokenCSS("", generateTokenCSS({
  breakpoints: { laptop: 1100 },                                // thresholds, applied first
  fontSize: { base: "18px", jumbo: "96px" },                    // override + custom variant
  brandColor: { primary: { day: "#dc0000", night: "#ff6666" } }, // themed
  gap: { base: { phone: "12px", "laptop+": "20px" } },          // responsive
}))
```

Registers every token (so `getToken` and `listTokens` see it) and returns CSS with the same shape as `tokens.css`. In React, `setTokens` from nice-react-styles does both calls.

### Breakpoints

| Name | Range |
|---|---|
| `phone` | below `tablet` |
| `tablet` | 641px |
| `laptop` | 1280px |
| `desktop` | 1720px |

```ts
import { getBreakpoint, getBreakpointValue } from "nice-styles"

getBreakpoint("tablet+")      // "@media (min-width: 641px)"
getBreakpointValue("laptop")  // 1280
```

The floors are also tokens — reserved group `breakpoints`, variant = breakpoint name:

```ts
getToken("breakpoints:laptop")                  // "var(--np--breakpoints--laptop)"
getToken("breakpoints:laptop", { as: "value" }) // "1280px"
```

Keys: a bare name is one band (`tablet`), `+` is that breakpoint and wider, `-` is that breakpoint and narrower. Thresholds come from `src/tokens/breakpoints.json` and can be changed at runtime with the `breakpoints` key.

### Other services

| Export | Purpose |
|---|---|
| `getConstant` / `getConstantKey` | Build a `var(--np--…)` / `--np--…` name without a registry lookup |
| `applyTheme(theme, root?)` | Set `data-theme` on an element (default `document.documentElement`) |
| `transformColor(group, { token, theme, values })` | Compute a colour token's hsla channels to a static `hsla()` string. Same channel vocabulary as `getToken`'s `transform`: `200` sets, `"+30"` / `"-30"` shift, `"*0.55"` scales, `null` leaves alone |
| `registry` / `registerTokens` | The token store (`Map` keyed by variable name) and its runtime writer |
| `injectFonts`, `buildGoogleFontsConfig`, `buildAdobeFontsConfig` | Font loading without React |
| `isStyleValue(kind, value)` | Classify a value as a theme or breakpoint value |

## Tokens

| Group | Variants |
|---|---|
| `animationDuration` | faster, fast, base, slow, slower |
| `animationEasing` | base, linear, ease-in, ease-out, ease |
| `backgroundColor` | base, dark, success, highlight, warning, error, link (themed, inverse) |
| `backgroundSize` | base, contain, cover, fill, none, scale-down |
| `borderColor` | base, light, dark, darker, success, highlight, warning, error, link (themed) |
| `borderRadius` | none, smaller, small, base, large, larger |
| `borderWidth` | none, smaller, small, base, large, larger |
| `boxShadow` | base, large |
| `brandColor` | base, secondary |
| `color` | base, light, lighter, lightest, disabled, link, success, highlight, warning, error (themed, inverse) |
| `fontFamily` | base, code, heading |
| `fontSize` | smaller, small, base, large, larger (responsive) |
| `fontWeight` | light, base, medium, semibold, bold, extrabold, black |
| `gap` | none, smaller, small, base, large, larger |
| `letterSpacing` | tight, base, wide, wider |
| `lineHeight` | single, condensed, base, expanded |
| `size` | smaller, small, base, large, larger |
| `zIndex` | base, low, medium, high, higher |

Component token sets: `button`, `code`, `icon`, `image`, `ink`, `input`, `lightbox`, `tile`.

Each group has a variant union type: `GapType`, `ColorType`, `ColorInverseType`, …, plus `ComponentPrefix`.

## Development

### Token sources

| File | Contents |
|---|---|
| `src/tokens/modules/{group}.json` | One group: base variants, plus optional `$themes`, `$breakpoints`, `$inverse` |
| `src/tokens/components/{prefix}.json` | One component's nested token tree, plus optional `$themes`, `$breakpoints` |
| `src/tokens/breakpoints.json` | Breakpoint floors in pixels |

Adding a group or component is one new file; the build discovers it.

### Build

```bash
npm run build        # clean → tokens → types → css → tsc → post
npm run dev          # watch mode
npm test             # node:test snapshot and behavior tests
npm run test:update  # accept intended output changes
```

| Stage | Script | Output |
|---|---|---|
| `build:tokens` | `scripts/generateTokens/` | `src/generated/*Data.ts` (runtime token data) |
| `build:types` | `scripts/generateTypes/` | `src/generated/types.ts` |
| `build:css` | `scripts/generateCss/` | `dist/tokens.css`, `dist/css/*.css`, breakpoint CSS |

All stages read sources through `scripts/shared/readTokenSources.ts`, which validates overrides against their base values. CSS lines come from `src/utilities/css/`, the same emitters `generateTokenCSS` uses at runtime.

## License

MIT © Mohammed Ibrahim
