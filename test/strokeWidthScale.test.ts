/**
 * The root `strokeWidthScale` group and its icon component layer.
 *
 * The root group is themed (1 in day, 0.9 in night); `icon.strokeWidthScale` aliases it, so the
 * component follows the root's theming. Value reads with a theme pin follow the alias; var/key
 * reads with a pin still need a real primitive, which an alias doesn't have.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getToken, registry } from '../src/index.js'

test('the root strokeWidthScale group is themed', () => {
  assert.deepEqual(registry.get('--np--stroke-width-scale')?.seed, { day: '1', night: '0.9' })
  assert.equal(getToken('strokeWidthScale'), 'var(--np--stroke-width-scale)')
  assert.equal(getToken('strokeWidthScale', { theme: 'night' }), 'var(--np--stroke-width-scale--night)')
})

test('tokens.css carries the root primitives and switches the semantic variable', () => {
  const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8')
  assert.match(css, /--np--stroke-width-scale--day: 1;/)
  assert.match(css, /--np--stroke-width-scale--night: 0\.9;/)
  assert.match(css, /--np--stroke-width-scale: var\(--np--stroke-width-scale--night\);/)
  assert.match(css, /--np--icon--stroke-width-scale: var\(--np--stroke-width-scale\);/)
})

test('a value read of the icon alias follows it into the root, per theme', () => {
  assert.equal(registry.get('--np--icon--stroke-width-scale')?.seed, 'var(--np--stroke-width-scale)')
  assert.equal(getToken('icon.strokeWidthScale:base', { theme: 'day', as: 'value' }), '1')
  assert.equal(getToken('icon.strokeWidthScale:base', { theme: 'night', as: 'value' }), '0.9')
})

test('a var read of the alias with a theme pin still throws: it has no primitive of its own', () => {
  assert.throws(() => getToken('icon.strokeWidthScale:base', { theme: 'night' }), /Mode "night" not found/)
})
