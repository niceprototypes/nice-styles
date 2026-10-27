/**
 * Interaction-state variants in component tokens, and nested component overrides.
 *
 * `button.icon.color` carries `base` (rest), `hover`, `focus` and `active`; the unset states
 * reference base. A `setTokens` map overrides one state through the component's nested tree
 * (`{ button: { icon: { color: { hover } } } }`), with a plain, theme, or breakpoint value.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateTokenCSS, getToken, registry } from '../src/index.js'

test('button.icon.color has state variants that follow base by default', () => {
  assert.equal(registry.get('--np--button--icon--color')?.seed, 'currentColor')
  for (const state of ['hover', 'focus', 'active']) {
    assert.equal(registry.get(`--np--button--icon--color--${state}`)?.seed, 'var(--np--button--icon--color)')
  }
  assert.equal(getToken('button.icon.color:hover'), 'var(--np--button--icon--color--hover)')
})

test('a nested component override reaches the state variant it names', () => {
  const css = generateTokenCSS({ button: { icon: { color: { hover: 'red' } } } })
  assert.match(css, /--np--button--icon--color--hover: red;/)
  assert.doesNotMatch(css, /--np--button--icon--color: /)
})

test('a state variant override can carry day and night values', () => {
  const css = generateTokenCSS({ button: { icon: { color: { hover: { day: 'red', night: 'blue' } } } } })
  assert.match(css, /--np--button--icon--color--hover--day: red;/)
  assert.match(css, /--np--button--icon--color--hover--night: blue;/)
  assert.match(css, /--np--button--icon--color--hover: var\(--np--button--icon--color--hover--night\);/)
})

test('a state variant override can carry breakpoint values', () => {
  const css = generateTokenCSS({ button: { icon: { color: { hover: { 'phone+': 'red', 'laptop+': 'green' } } } } })
  assert.match(css, /--np--button--icon--color--hover: red;/)
  assert.match(css, /@media \(min-width: \d+px\) \{\s*:root \{\s*--np--button--icon--color--hover: green;/)
})

test('a single value at a group position still overrides that group’s base variant', () => {
  const css = generateTokenCSS({ button: { icon: { size: '10px' } } })
  assert.match(css, /--np--button--icon--size: 10px;/)
})
