/**
 * Type Definitions for nice-styles Design Tokens
 *
 * This module provides TypeScript type definitions for all design tokens.
 *
 * @module types
 */

/**
 * Represents a single design token with a name and value
 */
export interface StyleTokenProps {
  /** The token name (e.g., "base", "large") */
  name: string
  /** The token value (e.g., "16px", "hsla(0, 0%, 0%, 1)") */
  value: string
}

/**
 * Represents a collection of design tokens with optional comment
 */
export interface StyleTokensProps {
  /** Optional comment describing the token group */
  comment?: string
  /** Array of token entries */
  tokens: StyleTokenProps[]
}

/**
 * Token object with numbered keys
 * @deprecated This type is deprecated and will be removed in v5.0.0
 */
export type StyleNumberedTokenProps<T = string> = Record<number, T>

/**
 * Token object with string keys (semantic names)
 *
 * This is the primary type used for all token exports.
 * Keys are semantic names (e.g., "base", "large", "lighter")
 * Values are CSS values as strings
 *
 * @example
 * const fontSize: StyleNamedTokenProps = {
 *   base: "16px",
 *   large: "20px",
 *   small: "14px"
 * }
 */
export type StyleNamedTokenProps = Record<string, string>