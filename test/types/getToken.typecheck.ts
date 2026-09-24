/**
 * Compile-time fixture for `getToken`'s typed overloads. Not run — type-checked
 * by `test/getTokenTypes.test.ts`. Each `@ts-expect-error` line must fail to
 * compile; an unused directive fails the check, so a regression either way is caught.
 */

import { getToken, type SizeType, type TokenAddress } from '../../src/index.js'

declare const size: SizeType
declare const anyString: string

// ── Valid ──────────────────────────────────────────────────────────────────

// Address form: core, bare base, component, nested component, inverse effect, reserved breakpoints
getToken('gap')
getToken('gap:base')
getToken('fontSize:large')
getToken('button.size:small')
getToken('button.icon.size:small')
getToken('color:base:inverse')
getToken('ink.color:highlight:inverse')
getToken('breakpoints:laptop')
getToken('popover.offset:base', { as: 'value' })
getToken('input.width:2')
getToken('input.focusRing.color')

// Two-argument form, with and without the variant
getToken('gap', 'base', { as: 'value' })
getToken('fontSize', 'large')
getToken('fontSize')
getToken('color', undefined, { inverse: true })
getToken('input.width', '2')
getToken('input.size', size)

// Template literal over a union variable narrows to a union of valid addresses
getToken(`input.size:${size}`)
getToken(`button.icon.size:${size}`, { as: 'key' })

// The address union is exported for wrappers
const address: TokenAddress = 'calendar.cell.size:large'
getToken(address)

// ── Invalid ────────────────────────────────────────────────────────────────

// @ts-expect-error — "dark" is not a backgroundColor variant (renamed to "raised")
getToken('backgroundColor', 'dark')

// @ts-expect-error — same, address form
getToken('backgroundColor:dark')

// @ts-expect-error — unknown group
getToken('lineHeights', 'base')

// @ts-expect-error — unknown component group
getToken('input.height:base')

// @ts-expect-error — input.width has no base variant, so the variant is required
getToken('input.width')

// @ts-expect-error — not a width variant
getToken('input.width:6')

// @ts-expect-error — gap has no inverse dimension
getToken('gap:base:inverse')

// @ts-expect-error — a runtime custom group is rejected until declared on CustomTokenVariants (see customTokens.typecheck.ts)
getToken('contentMaxWidth')

// @ts-expect-error — a plain string is not an address
getToken(anyString)

// @ts-expect-error — a template over a plain string is not an address
getToken(`input.size:${anyString}`)
