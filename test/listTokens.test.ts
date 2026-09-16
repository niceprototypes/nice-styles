/**
 * `listTokens` behavior table.
 *
 * Runs against the seeded registry, then after `generateTokenCSS` adds runtime
 * values. Tests run in order and share one registry; each test file runs in
 * its own process.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listTokens, registry, generateTokenCSS, type ListTokensFilter } from '../src/index.js'

/**
 * The one listing with `key` among those matching `filter`. Looking up by key
 * keeps assertions exact when a filter also matches component tokens.
 *
 * @param key - CSS variable name to find
 * @param filter - Filter passed to `listTokens` first
 * @returns The matching listing; fails the test unless exactly one matches
 */
function listingFor(key: string, filter: ListTokensFilter = {}) {
  const matches = listTokens(filter).filter((listing) => listing.key === key)
  assert.equal(matches.length, 1, `expected one listing for ${key}`)
  return matches[0]
}

// With no filter, the listing is the registry: one listing per entry
test('lists every registered token once', () => {
  assert.equal(listTokens().length, registry.size)
})

// The full listing shape for a plain generated token — pins every field
test('core token listing: identity, no dimensions, seed source', () => {
  assert.deepEqual(listingFor('--np--gap', { group: 'gap', variant: 'base' }), {
    key: '--np--gap', prefix: undefined, path: ['gap'], variant: 'base', inverse: false, themes: [], breakpoints: [], source: 'seed',
  })
})

// `group` matches the first path segment regardless of prefix — the `code`
// component also has a `gap` group — so it is not a core-only filter
test('group filter spans core and component tokens with that first path segment', () => {
  const prefixes = listTokens({ group: 'gap', variant: 'base' }).map((listing) => listing.prefix)
  assert.ok(prefixes.includes(undefined))
  assert.ok(prefixes.includes('code'))
})

// `themes` / `breakpoints` are read from the stored value shapes, not from the name
test('themes, breakpoints, and inverse come from the stored values', () => {
  // Themed group: day/night keys; its inverse entry is listed separately under the same group
  const color = listingFor('--np--color', { group: 'color' })
  assert.deepEqual([color.inverse, color.themes], [false, ['day', 'night']])
  assert.equal(listingFor('--np--color--inverse', { group: 'color' }).inverse, true)

  // Responsive group: breakpoint keys, and a breakpoint map is never reported as themes
  const fontSize = listingFor('--np--font-size--large', { group: 'fontSize' })
  assert.ok(fontSize.breakpoints.includes('laptop'))
  assert.deepEqual(fontSize.themes, [])
})

test('prefix filter returns only that component, with nested paths', () => {
  const button = listTokens({ prefix: 'button' })
  // Non-empty guard: `every` on an empty list would pass vacuously
  assert.ok(button.length > 0)
  assert.ok(button.every((listing) => listing.prefix === 'button'))
  // Nested component groups keep their full path (`["icon", "size"]`), not just the leaf
  assert.ok(listTokens({ prefix: 'button', group: 'icon' }).every((listing) => listing.path.length > 1))
})

// Last test: it mutates the registry. An override of a generated token has
// both layers; a new name has only the runtime layer.
test('source reflects layers after runtime registration', () => {
  generateTokenCSS({ gap: { base: '20px' }, listTokensProbe: { base: '1px' } })

  assert.equal(listingFor('--np--gap').source, 'both')
  // Exactly the one new name — overrides of seeded tokens are "both", not "runtime"
  assert.deepEqual(
    listTokens({ source: 'runtime' }).map((listing) => listing.key),
    ['--np--list-tokens-probe']
  )
})
