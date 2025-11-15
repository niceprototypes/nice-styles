# nice-styles

A collection of CSS custom properties (variables) for consistent design tokens.

## Features

- 🎨 **Comprehensive Design System** - Complete set of design tokens for typography, colors, spacing, and more
- 📦 **Modular** - Import only what you need for optimal bundle size
- 🔤 **TypeScript Support** - Full TypeScript definitions with type safety
- 🎯 **Semantic Naming** - Clear, descriptive variable names using camelCase
- 🔄 **Reverse Variants** - Built-in dark mode support with reverse color variants
- 📏 **Consistent Scale** - Thoughtfully designed size scales across all dimensions
- 🔡 **Alphabetically Organized** - All variables and keys sorted alphabetically for easy discovery

## Installation

```bash
npm install nice-styles
```

## Usage

### CSS Import

Import all CSS variables into your project:

```css
@import 'nice-styles/variables.css';
```

Or import directly in your HTML:

```html
<link rel="stylesheet" href="node_modules/nice-styles/variables.css">
```

### Import Individual Variable Groups

For better performance and smaller bundle sizes, import only the variables you need:

```css
@import 'nice-styles/static/css/border-radius.css';
@import 'nice-styles/static/css/font-size.css';
@import 'nice-styles/static/css/gap-size.css';
```

Available individual CSS files:
- `animation.css` - Duration and easing
- `background-color.css` - Background colors
- `border-color.css` - Border colors
- `border-radius.css` - Border radius values
- `border-width.css` - Border width values
- `box-shadow.css` - Shadow styles
- `cell-height.css` - Cell height values
- `content-color.css` - Text and content colors
- `font-family.css` - Font stacks
- `font-size.css` - Font size scale
- `font-weight.css` - Font weight values
- `gap-size.css` - Spacing scale
- `icon.css` - Icon stroke colors and widths
- `line-height.css` - Line height values
- `reverse.css` - Reverse color variants

### TypeScript/JavaScript Usage

Access design tokens programmatically in your TypeScript or JavaScript code:

```typescript
import {
  fontSize,
  gapSize,
  contentColor,
  hasVariable,
  getVariableKeys
} from 'nice-styles'

// Access specific values
console.log(fontSize.default) // "16px"
console.log(gapSize.large) // "32px"
console.log(contentColor.link) // "hsla(202, 100%, 50%, 1)"
console.log(contentColor.error) // "hsla(10, 92%, 63%, 1)"

// Check if a variable exists
if (hasVariable('fontSize', 'large')) {
  console.log('fontSize.large exists!')
}

// Get all available keys for a category
const fontSizeKeys = getVariableKeys('fontSize')
// ['default', 'large', 'larger', 'small', 'smaller']
```

## Available Constants

This package provides a comprehensive set of CSS custom properties using semantic naming for better clarity:

- **Animation**: Duration (default, slow) and easing values
- **Background Color**: Primary and secondary colors with reverse variants
- **Border**: Colors (primary, secondary), radius (smaller → larger), width (default, large)
- **Box Shadow**: Default and large shadow options with reverse variants
- **Cell Height**: Five size options (smaller, small, default, large, larger)
- **Content Color**: Nine color levels including neutral shades (darker, dark, default, light, lighter) and status colors (link, success, error, warning)
- **Font Family**: Heading, body, and code font stacks
- **Font Size**: Five size levels (smaller → larger)
- **Font Weight**: Seven weight levels (light, regular, medium, semibold, bold, extrabold, black)
- **Gap Size**: Five spacing levels (smaller → larger: 4px, 8px, 16px, 32px, 48px)
- **Icon Stroke**: Width and color values
- **Line Height**: Condensed, default, and expanded options

See [variables.css](./variables.css) for the complete list of available variables.

## Examples

### Basic Component Styling

```css
.card {
  background-color: var(--background-color-default);
  color: var(--content-color-dark);
  border: var(--border-width-default) solid var(--border-color-secondary);
  border-radius: var(--border-radius-default);
  padding: var(--gap-size-default);
  box-shadow: var(--box-shadow-default);
}
```

### Typography

```css
.heading {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-larger);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-condensed);
  color: var(--content-color-darker);
}

.body-text {
  font-family: var(--font-family-body);
  font-size: var(--font-size-default);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-default);
  color: var(--content-color-dark);
}

.code-block {
  font-family: var(--font-family-code);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
}
```

### Status Colors

```css
.link {
  color: var(--content-color-link);
  font-weight: var(--font-weight-medium);
}

.success-message {
  color: var(--content-color-success);
  font-weight: var(--font-weight-semibold);
}

.error-message {
  color: var(--content-color-error);
  font-weight: var(--font-weight-bold);
}

.warning-banner {
  background-color: var(--background-color-active);
  color: var(--content-color-warning);
  padding: var(--gap-size-small);
  border-radius: var(--border-radius-small);
}
```

### Dark Mode with Reverse Variants

```css
.dark-mode {
  background-color: var(--background-color-darker-reverse);
  color: var(--content-color-default-reverse);
}

.dark-mode .card {
  background-color: var(--background-color-dark-reverse);
  color: var(--content-color-light-reverse);
  border-color: var(--border-color-secondary-reverse);
}

.dark-mode .icon {
  stroke: var(--icon-stroke-color-default-reverse);
  stroke-width: var(--icon-stroke-width-default);
}
```

### Spacing and Layout

```css
.container {
  padding: var(--gap-size-large);
  gap: var(--gap-size-default);
}

.compact-list {
  gap: var(--gap-size-small);
}

.spacious-section {
  margin-top: var(--gap-size-larger);
  margin-bottom: var(--gap-size-larger);
}
```

### Icons

```css
.icon {
  stroke: var(--icon-stroke-color-default);
  stroke-width: var(--icon-stroke-width-default);
}

.icon-primary {
  stroke: var(--icon-stroke-color-primary);
  stroke-width: var(--icon-stroke-width-large);
}
```

## Token Map

A comprehensive overview of all design tokens and their available keys:

```
animationDuration
├─ default
└─ slow

animationEasing
└─ default

backgroundColor
├─ active
└─ default

backgroundColorReverse
├─ dark
├─ darker
├─ default
├─ light
└─ lighter

borderColor
├─ primary
└─ secondary

borderColorReverse
├─ primary
└─ secondary

borderRadius
├─ default
├─ large
├─ larger
├─ small
└─ smaller

borderWidth
├─ default
└─ large

boxShadow
├─ default
├─ defaultReverse
├─ large
└─ largeReverse

cellHeight
├─ default
├─ large
├─ larger
├─ small
└─ smaller

contentColor
├─ dark
├─ darker
├─ default
├─ error
├─ light
├─ lighter
├─ link
├─ success
└─ warning

contentColorReverse
├─ dark
├─ darker
├─ default
└─ light

fontFamily
├─ body
├─ code
└─ heading

fontSize
├─ default
├─ large
├─ larger
├─ small
└─ smaller

fontWeight
├─ black
├─ bold
├─ extrabold
├─ light
├─ medium
├─ regular
└─ semibold

gapSize
├─ default
├─ large
├─ larger
├─ small
└─ smaller

iconStrokeColor
├─ default
└─ primary

iconStrokeColorReverse
├─ default
└─ primary

iconStrokeWidth
├─ default
└─ large

lineHeight
├─ condensed
├─ default
└─ expanded
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT