[2026-05-27 14:55] patch: Fix CSS-emit regression from the mode → theme rename — emitCoreTokens.ts was still passing `{ mode: "day" }` / `{ mode: "night" }` to `getConstantKey`, but `CssConstantOptions.mode` had been renamed to `theme`. The unrecognized `mode` option silently dropped the suffix, so `--np--color--base--day` and `--np--color--base--night` primitives were emitted as `--np--color--base` and overwrote the semantic var at `:root` (night winning by source order). All `--np--color--*`, `--np--background-color--*`, and `--np--border-color--*` resolved to night values regardless of `data-theme`. Pass `{ theme: "day" }` / `{ theme: "night" }` instead; rebuild restores the suffixed primitives at lines 88 / 104 of `dist/tokens.css` and the `[data-theme="…"]` cascade works again.

[2026-05-26 03:30] major: Rename `mode` → `theme` across the API surface to align with the `data-theme` HTML attribute and CSS cascade.

API renames:
- Type `ModeType` → `ThemeType` (file `src/modeTypes.ts` → `src/themeTypes.ts`)
- Type `ModeValue` → `ThemeValue` (in `src/types/styleValues.ts`)
- Constant `DEFAULT_MODE` → `DEFAULT_THEME`
- `STYLE_VALUE_KEYS.mode` → `STYLE_VALUE_KEYS.theme`
- Services `getModeToken`/`getModeTokenKey`/`getModeTokenValue` → `getThemeToken`/`getThemeTokenKey`/`getThemeTokenValue` (file `getModeToken.ts` → `getThemeToken.ts`)
- Service `setModeTokens` → `setThemeTokens` (file `setModeTokens.ts` → `setThemeTokens.ts`)
- `mode` parameter on `getComponentToken*`, `getToken*`, `getConstant*`, `getTokenFromMap`, `getTokenByPath` → `theme`
- `CssConstantOptions.mode` → `CssConstantOptions.theme`
- `RegistryEntry.modes` → `RegistryEntry.themes`; `DimensionedTokenSeed.modesForEntry` → `themesForEntry`
- `isStyleValue("mode", …)` kind discriminator → `isStyleValue("theme", …)`
- Source file `src/tokens/module.modes.json` → `src/tokens/module.themes.json`
- Generated file `src/generated/modeTokensData.ts` → `themeTokensData.ts` (and its type `ModeTokensData` → `ThemeTokensData`)

Removals:
- `getInvertedMode` service deleted entirely (consumers should inline the inversion logic at the call site).

Renamed export:
- `Theme` (the styled-components-bound aggregate object passed to `<ThemeProvider theme={…}>`) → `Colors`. Frees the `Theme` name for the `<Theme>` component being introduced in nice-react-styles. The object still carries more than colors (core primitives + small-breakpoint sizes) but `Colors` is the closest single-word name that doesn't collide. The only consumer that imports it (`nice-react-styles`'s `StylesProvider`) is updated in lockstep.

Unchanged:
- CSS variable suffixes `--day` and `--night` keep their names (151 occurrences in `dist/tokens.css`).
- `[data-theme="day"]` and `[data-theme="night"]` selectors unchanged.
- Source-side `"day"` / `"night"` values unchanged (renaming those would conflict with existing `dark`/`darker`/`lighter` variant names).

Consumer migration: every consumer of `ModeType`, `ModeValue`, `DEFAULT_MODE`, `getModeToken*`, `setModeTokens`, `getInvertedMode`, or the `mode` parameter must update. No deprecation alias period — workspace-internal refactor; downstream packages migrate in the same change cycle.

[2026-05-26 02:30] patch: Adjust backgroundColor and borderColor token values — give day mode visible striping contrast between base and dark backgrounds, soften night-mode dark backgroundColor for less aggressive contrast, and darken day borderColor.darker.