/**
 * Represents a CSS custom property definition
 */
export interface CSSVariable {
  name: string
  value: string
}

/**
 * Represents a group of related CSS variables
 */
export interface CSSVariableGroup {
  comment?: string
  variables: CSSVariable[]
}

/**
 * Numbered variable configuration
 */
export type NumberedVariables<T = string> = Record<number, T>

/**
 * Named variable configuration
 */
export type NamedVariables = Record<string, string>