/**
 * Compile-time fixture for the `CustomTokenVariants` declaration-merging hook.
 * Not run — type-checked by `test/getTokenTypes.test.ts`, separately from
 * `getToken.typecheck.ts` so the augmentation below does not reach that fixture
 * (which asserts the same custom group is rejected when undeclared).
 *
 * Imports the package by its own name, so it checks the built `dist/` types —
 * the exact module a consumer augments.
 */

import { getToken, type TokenAddress } from 'nice-styles'

// The consumer's declaration — what an app writes next to its setTokens call
declare module 'nice-styles' {
  interface CustomTokenVariants {
    contentMaxWidth: 'base' | 'wide'
  }
}

// ── Valid ──────────────────────────────────────────────────────────────────

// Declared custom group: bare (has base), address, and two-argument forms
getToken('contentMaxWidth')
getToken('contentMaxWidth:wide')
getToken('contentMaxWidth', 'wide', { as: 'value' })
const address: TokenAddress = 'contentMaxWidth:base'
getToken(address)

// Generated groups are unaffected by the augmentation
getToken('gap:large')
getToken('input.width', '10')

// ── Invalid ────────────────────────────────────────────────────────────────

// @ts-expect-error — not a declared variant of the custom group
getToken('contentMaxWidth:narrow')

// @ts-expect-error — custom groups carry no inverse effect
getToken('contentMaxWidth:base:inverse')

// @ts-expect-error — a custom group nobody declared is still rejected
getToken('pageGutter')
