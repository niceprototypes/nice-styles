/**
 * Partial theme values in a `setTokens` map.
 *
 * A map that sets only `day` (or only `night`) for a token changes that theme and leaves the
 * other as the token's sources define it, whatever kind of token it is: themed core token,
 * component token with a `$themes.night` override, component alias to a themed core token,
 * or a theme-independent value.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { completeThemeValue } from '../src/utilities/completeThemeValue.js'
import { registry } from '../src/index.js'

test('a component token with a $themes.night override is seeded { day, night }', () => {
  assert.deepEqual(registry.get('--np--logo--color')?.seed, {
    day: 'var(--np--color--day)',
    night: 'var(--np--color--night)',
  })
})

test('day only: night keeps the component token’s own night value', () => {
  assert.deepEqual(completeThemeValue('logo.color', 'base', { day: 'red' }), {
    day: 'red',
    night: 'var(--np--color--night)',
  })
})

test('night only: day keeps the component token’s own day value', () => {
  assert.deepEqual(completeThemeValue('logo.color', 'base', { night: 'blue' }), {
    day: 'var(--np--color--day)',
    night: 'blue',
  })
})

test('a themed core token keeps its generated value for the theme left out', () => {
  const seed = registry.get('--np--color')?.seed as Record<string, string>
  assert.deepEqual(completeThemeValue('color', 'base', { day: 'red' }), { day: 'red', night: seed.night })
})

test('an alias to a themed core token keeps following the core’s primitive', () => {
  assert.deepEqual(completeThemeValue('icon.color', 'base', { day: 'red' }), {
    day: 'red',
    night: 'var(--np--color--night)',
  })
})

test('a theme-independent token keeps its one value in the theme left out', () => {
  assert.deepEqual(completeThemeValue('gap', 'base', { night: '20px' }), { day: '16px', night: '20px' })
})

test('complete theme values, plain values, breakpoint maps and unknown tokens pass through', () => {
  const complete = { day: 'red', night: 'blue' }
  assert.equal(completeThemeValue('color', 'base', complete), complete)
  assert.equal(completeThemeValue('color', 'base', 'red'), 'red')
  const breakpoints = { phone: '1px', laptop: '2px' }
  assert.equal(completeThemeValue('gap', 'base', breakpoints), breakpoints)
  const unknown = { day: 'red' }
  assert.equal(completeThemeValue('projectColor', 'primary', unknown), unknown)
})
