/**
 * Runtime CSS generation.
 *
 * Snapshots `generateTokenCSS` output for a fixture covering every value shape,
 * then exercises the `breakpoints` key: validation, application before the
 * call's own CSS, breakpoint stylesheet re-emission, and regeneration of earlier
 * injected token CSS. Tests run in order and share module state.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { installDomStub, stylesheetText } from './helpers/dom.js'
import { matchSnapshot } from './helpers/snapshot.js'
import { generateTokenCSS, injectTokenCSS, getBreakpointValue, getBreakpoint } from '../src/index.js'

// Injection writes to `document`; the stub captures the stylesheets for assertions
installDomStub()

// One map exercising every value shape. The snapshot pins the whole CSS text,
// so any change to line format, block order, or media queries shows as a diff.
test('fixture map: flat, theme, extra theme, breakpoint ranges, component override', () => {
  const css = generateTokenCSS({
    // Themed custom token with an extra theme (sepia → [data-theme="sepia"] pin), plus a plain variant
    brandColor: { primary: { day: 'red', night: 'pink', sepia: 'brown' }, onBrand: '#fff' },
    // Override of a generated themed token
    color: { light: { day: 'gray', night: 'white' } },
    // `phone+` spans every viewport (lands in :root); `laptop+` becomes a min-width block
    gap: { base: { 'phone+': '28px', 'laptop+': '32px' }, none: '0' },
    // Down range (max-width), exact band, and up range on one variant
    band: { base: { 'tablet-': '1px', laptop: '2px', 'desktop+': '3px' } },
    // Component-prefix key → component token override
    button: { icon: { size: '10px' } },
  })
  matchSnapshot('runtime-fixture.css', css)
})

// Each throw guards a silent failure: a theme map without `day` would emit
// "[object Object]", and bad thresholds would produce overlapping media queries.
// Validation runs before any threshold changes, so these calls leave laptop at
// 1280 for the next test.
test('invalid values throw', () => {
  assert.throws(() => generateTokenCSS({ brand: { primary: { night: '#fff' } } }), /theme value with a "day" key/)
  // phone is the implicit base below tablet — it has no floor to set
  assert.throws(() => generateTokenCSS({ breakpoints: { phone: 300 } }), /"phone" cannot be set/)
  // tablet 1500 would sit above laptop 1280
  assert.throws(() => generateTokenCSS({ breakpoints: { tablet: 1500 } }), /must ascend/)
  assert.throws(() => generateTokenCSS({ breakpoints: { tablet: '700' } } as never), /positive number/)
})

test('breakpoints key: applied first, re-emitted, earlier CSS regenerated', () => {
  // An earlier call (prefix "site") injected at the default laptop floor
  injectTokenCSS('site', generateTokenCSS({ gap: { base: { 'phone+': '28px', 'laptop+': '32px' } } }, 'site'))
  assert.match(stylesheetText('data-nice-tokens'), /min-width: 1280px/)

  // Move laptop to 1100 in a call that also has a laptop+ value
  const css = generateTokenCSS({ breakpoints: { laptop: 1100 }, fontSize: { jumbo: { 'laptop+': '72px' } } })
  injectTokenCSS('', css)

  // Applied first: this call's own CSS already uses the new floor
  assert.match(css, /min-width: 1100px/)
  // Every threshold reader sees the change
  assert.equal(getBreakpointValue('laptop'), 1100)
  assert.equal(getBreakpoint('laptop+'), '@media (min-width: 1100px)')
  // The tokens sheet holds both prefixes; the "site" CSS must have been rebuilt at 1100
  matchSnapshot('runtime-breakpoints-tokens-sheet.css', stylesheetText('data-nice-tokens'))
  // The generated breakpoint cascade re-emitted at the new floor
  matchSnapshot('runtime-breakpoints-breakpoint-sheet.css', stylesheetText('data-nice-breakpoints'))
})

// `breakpoints: {}` is valid (nothing to change) and must neither warn, throw,
// nor reset thresholds — laptop stays at the 1100 set by the previous test
test('empty breakpoints key is a no-op', () => {
  assert.doesNotThrow(() => generateTokenCSS({ breakpoints: {}, gap: { base: '1px' } }))
  assert.equal(getBreakpointValue('laptop'), 1100)
})
