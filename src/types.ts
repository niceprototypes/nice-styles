/**
 * Represents a CSS custom property definition
 */
export interface VariableProps {
  name: string
  value: string
}

/**
 * Represents a group of related CSS variables
 */
export interface VariablesProps {
  comment?: string
  variables: VariableProps[]
}

/**
 * Numbered variable configuration
 */
export type NumberedVariableProps<T = string> = Record<number, T>

/**
 * Named variable configuration
 */
export type NamedVariableProps = Record<string, string>