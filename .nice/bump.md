[2026-06-03 20:48] patch: Split module.json token source into per-group files under tokens/modules/
[2026-06-05 13:44] minor: Add breakpoint axis to component tokens — components/*.json now accept $breakpoints, parallel to $themes
[2026-06-05 14:44] minor: Support alt-theme names beyond night — any $themes key emits a [data-theme] pin (modules and components)
[2026-06-08 23:25] minor: Add base-less token shorthands — bare (--np--color, --np--gap) and dimensional (--np--color--night, --np--font-size--desktop) aliases for module + component tokens. Shipped in tokens.css (auto) and standalone "nice-styles/shorthand.css"
[2026-06-09 02:35] major: Reorder button/input status tokens to property-then-state so `base` is terminal, matching the module shape. Renames emitted vars: --np--button--status--primary--base--background-color → --np--button--status--primary--background-color--base (same for input). Path lookups must use [status, type, property, state]
