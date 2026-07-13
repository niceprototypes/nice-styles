
[2026-07-12 09:30] minor: Add applyTheme(theme, root?) service — writes `data-theme` ("day"|"night") on the document root (or a given element) to switch the day/night token cascade. Bridges an external theme toggle (host app, Storybook dark-mode) into nice theming; no-ops during SSR. Exports applyTheme and the ThemeName type.
