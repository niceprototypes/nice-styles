# nice-styles

A type-safe design system with CSS custom properties and TypeScript tokens.

## Installation

```bash
npm install nice-styles
```

## Quick Start

### CSS

Import all CSS variables:

```css
@import 'nice-styles/variables.css';

.card {
  padding: var(--gap-base);
  border-radius: var(--border-radius-base);
  color: var(--foreground-color-base);
}
```

Or import individual token groups:

```css
@import 'nice-styles/dist/css/fontSize.css';
@import 'nice-styles/dist/css/gap.css';
```

### TypeScript/JavaScript

```typescript
import { fontSize, foregroundColor, gap } from 'nice-styles'

console.log(fontSize.base)           // "16px"
console.log(foregroundColor.link)    // "hsla(202, 100%, 50%, 1)"
console.log(gap.large)                // "32px"
```

## Architecture

### Data Structures

nice-styles provides design tokens in three complementary formats:

#### 1. Constants (SCREAMING_SNAKE_CASE)
Raw constant values exported individually:

```typescript
import { FONT_SIZE_BASE, FOREGROUND_COLOR_LINK } from 'nice-styles'

console.log(FONT_SIZE_BASE)         // "16px"
console.log(FOREGROUND_COLOR_LINK)  // "hsla(202, 100%, 50%, 1)"
```

**Use when:** You need direct access to individual constant values.

#### 2. Tokens (camelCase objects)
Organized token objects with semantic keys:

```typescript
import { fontSize, foregroundColor } from 'nice-styles'

console.log(fontSize.base)          // "16px"
console.log(fontSize.large)         // "20px"
console.log(foregroundColor.link)   // "hsla(202, 100%, 50%, 1)"
console.log(foregroundColor.error)  // "hsla(10, 92%, 63%, 1)"
```

**Use when:** You want semantic organization and better autocomplete.

#### 3. CSS Custom Properties (kebab-case)
CSS variables for runtime styling:

```css
:root {
  --font-size-base: "16px";
  --font-size-large: "20px";
  --foreground-color-link: "hsla(202, 100%, 50%, 1)";
  --foreground-color-error: "hsla(10, 92%, 63%, 1)";
}
```

**Use when:** You need runtime CSS theming and custom properties.

### How It Works

```
┌─────────────────────┐
│  src/constants.ts   │  ← ONLY file you manually edit
│  (Source of truth)  │
└──────────┬──────────┘
           │
           ↓
┌──────────────────────────┐
│ scripts/generate-tokens  │  Parses // Token: comments
└──────────┬───────────────┘
           │
           ├─────────────────────┐
           ↓                     ↓
    ┌─────────────┐      ┌──────────────┐
    │ src/tokens  │      │ variables.css│
    │   .ts       │      │ dist/css/*.css│
    └──────┬──────┘      └──────────────┘
           │
           ↓
    ┌─────────────┐
    │ TypeScript  │
    │  Compiler   │
    └──────┬──────┘
           │
           ↓
    ┌─────────────┐
    │  dist/      │
    │  tokens.js  │
    │  tokens.d.ts│
    └─────────────┘
```

### Package Exports

The `dist/` directory contains all compiled outputs consumed by users:

#### JavaScript/TypeScript Files

- **`dist/index.js`** + **`dist/index.d.ts`**
  - Main entry point
  - Exports all constants, tokens, and types
  - Used when: `import { fontSize } from 'nice-styles'`

- **`dist/constants.js`** + **`dist/constants.d.ts`**
  - All constant values (SCREAMING_SNAKE_CASE)
  - Compiled from `src/constants.ts`

- **`dist/tokens.js`** + **`dist/tokens.d.ts`**
  - All token objects (camelCase)
  - Generated from constants.ts, compiled by TypeScript

- **`dist/types.d.ts`**
  - TypeScript type definitions
  - `StyleNamedTokenProps`, `StyleTokenProps`, etc.

#### CSS Files

- **`variables.css`** (root level)
  - All CSS custom properties in one file
  - Used when: `@import 'nice-styles/variables.css'`

- **`dist/css/*.css`** (individual token files)
  - `animationDuration.css`
  - `fontSize.css`
  - `foregroundColor.css`
  - `gap.css`
  - ...and 11 more
  - Used when: `@import 'nice-styles/dist/css/fontSize.css'`

## Available Tokens

| Token | Keys | Example |
|-------|------|---------|
| `animationDuration` | base, slow | `"300ms"`, `"600ms"` |
| `animationEasing` | base | `"ease-in-out"` |
| `backgroundColor` | base, alternate | `"hsla(0, 100%, 100%, 1)"` |
| `borderColor` | base, dark, darker | `"hsla(240, 9%, 91%, 1)"` |
| `borderRadius` | smaller, small, base, large, larger | `"2px"` to `"32px"` |
| `borderWidth` | base, large | `"1.5px"`, `"2px"` |
| `boxShadow` | downBase, downLarge, upBase, upLarge | Shadow values |
| `cellHeight` | smaller, small, base, large, larger | `"24px"` to `"72px"` |
| `foregroundColor` | lighter, light, medium, dark, base, link, success, warning, error | Color values |
| `fontFamily` | base, code, heading | Font stacks |
| `fontSize` | smaller, small, base, large, larger | `"12px"` to `"24px"` |
| `fontWeight` | light, base, medium, semibold, bold, extrabold, black | `"300"` to `"900"` |
| `gap` | smaller, small, base, large, larger | `"4px"` to `"48px"` |
| `iconStrokeWidth` | base, large | `"1.5px"`, `"2px"` |
| `lineHeight` | condensed, base, expanded | `"1.25"` to `"1.75"` |

## Usage Examples

### TypeScript Component

```typescript
import { fontSize, foregroundColor, gap } from 'nice-styles'

const styles = {
  fontSize: fontSize.base,
  color: foregroundColor.base,
  padding: gap.base,
  linkColor: foregroundColor.link,
  errorColor: foregroundColor.error,
}
```

### CSS Styling

```css
.button {
  font-size: var(--font-size-base);
  padding: var(--gap-small) var(--gap-base);
  border-radius: var(--border-radius-base);
  background: var(--background-color-base);
  color: var(--foreground-color-base);
  font-weight: var(--font-weight-medium);
}

.button-primary {
  background: var(--foreground-color-link);
  color: var(--background-color-base);
}

.alert-error {
  color: var(--foreground-color-error);
  border: var(--border-width-base) solid var(--foreground-color-error);
  border-radius: var(--border-radius-small);
  padding: var(--gap-small);
}
```

### Namespaced Imports

```typescript
import { StyleConstants, StyleTokens } from 'nice-styles'

// Access via namespace
console.log(StyleConstants.FONT_SIZE_BASE)  // "16px"
console.log(StyleTokens.fontSize.base)      // "16px"
```

## Development

### Adding New Tokens

1. Edit `src/constants.ts` and add your constants with a `// Token:` comment:

```typescript
// Token: BUTTON_SIZE
export const BUTTON_SIZE_SMALL = "32px"
export const BUTTON_SIZE_MEDIUM = "40px"
export const BUTTON_SIZE_LARGE = "48px"
```

2. Run the token generator:

```bash
npm run build:tokens
```

This automatically generates:
- `src/tokens.ts` with `buttonSize` token object
- CSS variables in `variables.css`
- Individual `dist/css/buttonSize.css` file

3. Compile TypeScript:

```bash
npm run build:ts
```

Or run both with:

```bash
npm run build
```

### Build Process

```bash
# Generate tokens from constants
npm run build:tokens

# Compile TypeScript
npm run build:ts

# Run both
npm run build

# Watch mode
npm run watch
```

## Migration from v3.x

Version 4.0.0 removes all deprecated numbered token variants (e.g., `FONT_SIZE_1`, `BORDER_RADIUS_2`).

**Before (v3.x):**
```typescript
import { FONT_SIZE_1, borderRadius1 } from 'nice-styles'
```

**After (v4.x):**
```typescript
import { FONT_SIZE_BASE, borderRadius } from 'nice-styles'
console.log(borderRadius.base)
```

All numbered variants have been removed. Use semantic names instead:
- `_1` → `.base` or `.small`
- `_2` → `.large` or `.alternate`
- etc.

## License

MIT © Mohammed Ibrahim