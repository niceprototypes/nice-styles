/**
 * `getToken` behavior table.
 *
 * Covers every access form of the single getter against the seeded registry,
 * then the runtime layer after `generateTokenCSS` registers overrides. Tests in
 * this file run in order and share one module instance (registry state
 * carries forward); each test file runs in its own process.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getToken, generateTokenCSS, transformColor } from '../src/index.js'

// ── Seeded registry (generated data only) ──────────────────────────────────

// The three accessor forms of one plain core token. `base` is the implicit
// variant and adds no name segment.
test('core token: var, key, value', () => {
  assert.equal(getToken('gap'), 'var(--np--gap)')
  assert.equal(getToken('gap', 'base', { as: 'key' }), '--np--gap')
  assert.equal(getToken('gap', 'base', { as: 'value' }), '16px')
})

// Pinning a theme names its stable primitive (`--night`) and reads that
// theme's value. An unthemed token has no night primitive, so a pin must throw
// instead of returning a var() that resolves to nothing.
test('theme pin: var and value; throws for a token without that theme', () => {
  assert.equal(getToken('color', 'base', { theme: 'night' }), 'var(--np--color--night)')
  assert.equal(getToken('color', 'base', { theme: 'night', as: 'value' }), 'hsla(210, 5%, 95%, 1)')
  assert.throws(() => getToken('gap', 'base', { theme: 'night' }), /Mode "night" not found/)
})

// Inverse is its own registry entry (`--inverse` segment last), themed like the
// base group: its day value here is the regular color's night value.
test('inverse: var, day value, night value', () => {
  assert.equal(getToken('color', 'base', { inverse: true }), 'var(--np--color--inverse)')
  assert.equal(getToken('color', 'base', { inverse: true, as: 'value' }), 'hsla(210, 5%, 95%, 1)')
  assert.equal(getToken('color', 'base', { inverse: true, theme: 'night', as: 'value' }), 'hsla(210, 5%, 5%, 1)')
})

test('breakpoint pin: primitive var, resolved value, and guards', () => {
  // A responsive token has a generated primitive per breakpoint
  assert.equal(getToken('fontSize', 'large', { breakpoint: 'laptop' }), 'var(--np--font-size--large--laptop)')
  assert.equal(getToken('fontSize', 'large', { breakpoint: 'laptop', as: 'value' }), '24px')
  // A plain token has no `--tablet` primitive: the var form throws (the name would
  // not exist in CSS), while the value form is still well defined — the one value
  assert.throws(() => getToken('gap', 'base', { breakpoint: 'tablet' }), /no generated --tablet primitive/)
  assert.equal(getToken('gap', 'base', { breakpoint: 'tablet', as: 'value' }), '16px')
  // Old size names (`large`) are not breakpoint names — guards the phone/tablet/laptop/desktop rename
  assert.throws(() => getToken('fontSize', 'large', { breakpoint: 'large', as: 'value' }), /Breakpoint "large" not found/)
})

// Component tokens: a string name for a top-level group, a path array for a
// nested group. The stored value of an alias is the `var()` itself, not the
// core value it points at.
test('component tokens: flat name, nested path, value', () => {
  assert.equal(getToken('button.size:small'), 'var(--np--button--size--small)')
  assert.equal(getToken('button.icon.size:small'), 'var(--np--button--icon--size--small)')
  assert.equal(getToken('button.icon.size:base', { as: 'value' }), 'var(--np--font-size)')
})

// The address grammar: dots carry identity (namespace, then group path), the
// first colon carries the variant, the second a color-system effect.
test('address grammar: module, component, variant, effect', () => {
  // No dot before the colon → module token
  assert.equal(getToken('gap'), 'var(--np--gap)')
  assert.equal(getToken('fontSize:large'), 'var(--np--font-size--large)')
  // A dot before the colon → first segment is the namespace
  assert.equal(getToken('button.size:small'), 'var(--np--button--size--small)')
  assert.equal(getToken('button.icon.size:small'), 'var(--np--button--icon--size--small)')
  assert.equal(getToken('button.icon.size:base', { as: 'value' }), 'var(--np--font-size)')
  // Second colon → effect, the trailing key segment
  assert.equal(getToken('color:base:inverse'), 'var(--np--color--inverse)')
  assert.equal(getToken('color:base:inverse', { as: 'value' }), 'hsla(210, 5%, 95%, 1)')
  // Options stay for what is not identity
  assert.equal(getToken('color:base', { theme: 'night' }), 'var(--np--color--night)')
  assert.equal(getToken('fontSize:large', { breakpoint: 'laptop' }), 'var(--np--font-size--large--laptop)')
})

// `transform` wraps the token's var() in relative color syntax, so the result
// still follows the theme cascade. Identity channels collapse to the keyword.
test('transform returns a relative-color expression', () => {
  assert.equal(
    getToken('ink.color:highlight', { transform: ['*1', '*1', '*0.55', '*1'] }),
    'hsl(from var(--np--ink--color--highlight) h s calc(l * 0.55))'
  )
  // Mixed kinds: add, subtract, untouched, and an alpha clause only when alpha changes
  assert.equal(
    getToken('color:base', { transform: ['+10', '-20', null, '-0.2'] }),
    'hsl(from var(--np--color) calc(h + 10) calc(s - 20) l / calc(alpha - 0.2))'
  )
  // A bare number replaces the channel outright
  assert.equal(getToken('color:base', { transform: [200] }), 'hsl(from var(--np--color) 200 s l)')
  // A transformed color is an expression, so it has no variable name
  assert.throws(() => getToken('color:base', { transform: ['*0.5'], as: 'key' }), /no variable name/)
  assert.throws(() => getToken('color:base', { transform: ['20'] }), /signed magnitude .* or a ratio/)
})

// The value form computes the same adjustment in JS — one vocabulary, two
// renderings. `transformColor` runs through the same code.
test('transform computes a literal in the value form', () => {
  // Night base is hsla(210, 5%, 95%, 1); halving lightness gives 47.5%
  assert.equal(
    getToken('color:base', { theme: 'night', as: 'value', transform: [null, null, '*0.5', null] }),
    'hsla(210, 5%, 47.5%, 1)'
  )
  // Without a transform the value is untouched
  assert.equal(getToken('color:base', { theme: 'night', as: 'value' }), 'hsla(210, 5%, 95%, 1)')
})

// Breakpoint floors are tokens: the group is `breakpoints`, the variant is the
// breakpoint name, and the value carries its `px` unit so CSS and JS agree
test('breakpoint thresholds resolve as tokens', () => {
  assert.equal(getToken('breakpoints:tablet'), 'var(--np--breakpoints--tablet)')
  assert.equal(getToken('breakpoints:tablet', { as: 'value' }), '641px')
  assert.equal(getToken('breakpoints:laptop', { as: 'value' }), '1280px')
})

// The positional variant and `inverse: true` still resolve; an array addresses a
// module token, since a namespace can only be named by the address
test('older forms still resolve', () => {
  assert.equal(getToken('gap', 'large'), 'var(--np--gap--large)')
  assert.equal(getToken(['fontSize'], 'large'), 'var(--np--font-size--large)')
  assert.equal(getToken('color', 'base', { inverse: true }), 'var(--np--color--inverse)')
})

// ── Runtime layer (registry state now changes; later tests see it) ──────────

// Reading a custom token before `setTokens` runs in the same module evaluation
// is legal, so the unregistered check is deferred to a microtask. Only a name
// that is still unregistered then (a typo) warns.
test('unregistered name: var/key return the name and warn only if still unregistered; value throws', async () => {
  // Capture warnings instead of printing them
  const warnings: string[] = []
  const originalWarn = console.warn
  console.warn = (message: string) => warnings.push(message)
  try {
    // Read first, register second — no warning expected for this name
    assert.equal(getToken('contentMaxWidth'), 'var(--np--content-max-width)')
    generateTokenCSS({ contentMaxWidth: { base: '720px' } })
    // A misspelled name stays unregistered
    assert.equal(getToken('contnetMaxWidth'), 'var(--np--contnet-max-width)')
    // Yield to a macrotask so the pending microtask checks have run
    await new Promise((resolve) => setTimeout(resolve, 0))
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /--np--contnet-max-width/)
  } finally {
    console.warn = originalWarn
  }
  // There is no value to return for an unknown name, so the value form throws immediately
  assert.throws(() => getToken('nope', 'base', { as: 'value' }), /not found/)
})

// An override is layered per breakpoint, not swapped wholesale: the runtime
// `laptop+` value wins where it applies, and every other breakpoint falls back
// to the seed. `pristine` reads the seed only.
test('runtime layer over seed: per-breakpoint fallback and pristine', () => {
  generateTokenCSS({ fontSize: { large: { 'laptop+': '30px' } } })
  // No breakpoint means phone (the default); `laptop+` does not cover phone, so the seed answers
  assert.equal(getToken('fontSize', 'large', { as: 'value' }), '20px')
  assert.equal(getToken('fontSize', 'large', { breakpoint: 'laptop', as: 'value' }), '30px')
  assert.equal(getToken('fontSize', 'large', { breakpoint: 'laptop', as: 'value', pristine: true }), '24px')
})

test('component override is visible; prefixed flat tokens do not clobber core', () => {
  // A component-prefix key overrides that component's token. `{ icon: { size } }`
  // builds the same variable name as the seeded `["icon", "size"]` base, so it
  // lands on the seeded entry as its runtime layer.
  generateTokenCSS({ button: { icon: { size: '10px' } } })
  assert.equal(getToken('button.icon.size:base', { as: 'value' }), '10px')
  assert.equal(getToken('button.icon.size:base', { as: 'value', pristine: true }), 'var(--np--font-size)')
  // A call-level prefix namespaces flat tokens (`--np--tile--gap`); core `gap` must be untouched
  generateTokenCSS({ gap: { base: '99px' } }, 'tile')
  assert.equal(getToken('gap'), 'var(--np--gap)')
  assert.equal(getToken('tile.gap:base', { as: 'value' }), '99px')
  assert.equal(getToken('gap:base', { as: 'value' }), '16px')
})

// A threshold set at runtime updates the token, not just `BREAKPOINTS` — last in
// the file because it mutates the shared thresholds
test('setting a threshold updates its token value', () => {
  generateTokenCSS({ breakpoints: { tablet: 700 } })
  assert.equal(getToken('breakpoints:tablet', { as: 'value' }), '700px')
  // Untouched floors keep their generated value
  assert.equal(getToken('breakpoints:desktop', { as: 'value' }), '1720px')
})

// transformColor runs the same channel math as getToken's transform, so the
// ratio form reaches it too — the point of sharing one vocabulary
test('transformColor accepts ratios and signed magnitudes alike', () => {
  assert.equal(
    transformColor('color', { token: 'base', theme: 'night', values: [null, null, '*0.5', null] }),
    'hsla(210, 5%, 47.5%, 1)'
  )
  assert.equal(
    transformColor('color', { token: 'base', theme: 'night', values: [null, null, '-15', null] }),
    'hsla(210, 5%, 80%, 1)'
  )
})

// transformColor has no data of its own — it reads the color through getToken,
// so the theme option selects the night value. Guards the options-object signature.
test('transformColor reads through getToken', () => {
  assert.equal(transformColor('color', { token: 'error', values: ['+0', '-20', '+20', '-0.2'] }), 'hsla(10, 72%, 83%, 0.8)')
  assert.equal(transformColor('color', { token: 'error', theme: 'night' }), 'hsla(10, 82%, 75%, 1)')
})
