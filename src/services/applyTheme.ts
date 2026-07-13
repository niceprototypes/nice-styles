/** The Nice theme names — `day` (default / light) and `night` (dark). */
export type ThemeName = "day" | "night"

/**
 * Set the active Nice theme on a document root by writing the `data-theme`
 * attribute that nice-styles' `[data-theme]` token cascade responds to.
 *
 * Use this to bridge an external theme toggle (a host app's control, Storybook's
 * dark-mode addon, etc.) into nice's day/night theming — writing `data-theme`
 * flips every `var(--np--…)` token via the same cascade the tokens ship with.
 *
 * No-ops during SSR (no `document`) unless an explicit `root` is passed.
 *
 * @param theme - `"day"` or `"night"`.
 * @param root - Element to set `data-theme` on. @default document.documentElement
 */
export function applyTheme(theme: ThemeName, root?: HTMLElement): void {
  const el = root ?? (typeof document !== "undefined" ? document.documentElement : undefined)
  el?.setAttribute("data-theme", theme)
}