# nice-styles

A collection of CSS custom properties (variables) for consistent design tokens.

## Installation

```bash
npm install nice-styles
```

## Usage

### Import All Variables

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
- `gap-size.css` - Spacing scale
- `icon-stroke-width.css` - Icon stroke widths
- `icon-stroke-color.css` - Icon stroke colors
- `line-height.css` - Line height values
- `inverse.css` - Inverse color variants
- And more component-specific variables

## Available Variables

This package provides a comprehensive set of CSS custom properties including:

- **Animation**: Duration and easing values
- **Background Colors**: Primary and secondary background colors
- **Border**: Colors, radius, and width values
- **Box Shadow**: Multiple shadow options
- **Cell Height**: Standardized heights for UI elements
- **Content Colors**: Text colors including status colors (active, success, error, warning)
- **Font Family**: Heading, body, and code font stacks
- **Font Size**: Scale from 12px to 24px
- **Gap Size**: Spacing scale from 4px to 48px
- **Icon**: Stroke width and color values
- **Line Height**: Default and condensed options
- **Brand Colors**: Custom brand color palette

See [variables.css](./variables.css) for the complete list of available variables.

## Example

```css
.my-component {
  background-color: var(--background-color-1);
  color: var(--content-color-1);
  border-radius: var(--border-radius-2);
  padding: var(--gap-size-3);
  font-family: var(--font-family-body);
  font-size: var(--font-size-3);
}
```

## License

MIT