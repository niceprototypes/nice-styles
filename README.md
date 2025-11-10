# nice-styles

A collection of CSS custom properties (variables) for consistent design tokens.

## Installation

```bash
npm install nice-styles
```

## Usage

Import the CSS variables into your project:

```css
@import 'nice-styles';
```

Or import directly in your HTML:

```html
<link rel="stylesheet" href="node_modules/nice-styles/index.css">
```

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