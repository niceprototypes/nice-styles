/**
 * Shared types for the CSS generation pipeline.
 *
 * Used by: validate, emitCoreTokens, emitComponentTokens, assembleCombined, assembleColorScheme
 */

/** Flat token format: { tokenName: { variant: value } } */
export interface Tokens {
  [key: string]: Record<string, string>
}

/** Night overrides: sparse subset of Tokens, validated against day defaults */
export interface NightTokens {
  [tokenName: string]: Record<string, string>
}

/** Recursive token node: either a string leaf value or a nested object */
export type TokenNode = string | { [key: string]: TokenNode }

/** Component tokens: { prefix: { ...arbitrarily nested... leafValue } } */
export interface ComponentTokens {
  [prefix: string]: { [key: string]: TokenNode }
}

/** Error message templates with {placeholder} syntax */
export interface Errors {
  [key: string]: string
}

/**
 * Shared return shape for CSS emitters.
 *
 * Each emitter produces four line arrays that the assembler
 * places into different sections of the output files.
 */
export interface CssEmitResult {
  /** Lines for the semantic variables section (default values, reassigned by media query) */
  semanticLines: string[]
  /** Lines for the day primitives section (stable day references, never reassigned) */
  dayPrimitives: string[]
  /** Lines for the night primitives section (stable night references, never reassigned) */
  nightPrimitives: string[]
  /** Lines for the @media (prefers-color-scheme: dark) body in color-scheme.css */
  nightMediaBody: string[]
}
