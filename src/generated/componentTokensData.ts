/**
 * Auto-generated from src/tokens/components/*.json — do not edit by hand.
 * Regenerate: npm run build:tokens
 */

export type ComponentTokenNode = string | { [key: string]: ComponentTokenNode }

export type ComponentTokensData = Record<string, { [key: string]: ComponentTokenNode }>

const componentTokensData: ComponentTokensData = {
  "button": {
    "size": {
      "smaller": "var(--np--size--smaller)",
      "small": "var(--np--size--small)",
      "base": "var(--np--size)",
      "large": "var(--np--size--large)",
      "larger": "var(--np--size--larger)"
    },
    "spacing": {
      "smaller": "calc(var(--np--size--smaller) / 2)",
      "small": "calc(var(--np--size--small) / 2)",
      "base": "calc(var(--np--size) / 2)",
      "large": "calc(var(--np--size--large) / 2)",
      "larger": "calc(var(--np--size--larger) / 2)"
    },
    "borderRadius": {
      "none": "var(--np--border-radius--none)",
      "smaller": "var(--np--border-radius--smaller)",
      "small": "var(--np--border-radius--small)",
      "base": "var(--np--border-radius)",
      "large": "var(--np--border-radius--large)",
      "larger": "var(--np--border-radius--larger)",
      "rounded": "calc(var(--np--button--size) / 2)"
    },
    "borderWidth": {
      "none": "var(--np--border-width--none)",
      "smaller": "var(--np--border-width--smaller)",
      "small": "var(--np--border-width--small)",
      "base": "var(--np--border-width)",
      "large": "var(--np--border-width--large)",
      "larger": "var(--np--border-width--larger)"
    },
    "borderColor": {
      "base": "var(--np--border-color)",
      "dark": "var(--np--border-color--dark)",
      "darker": "var(--np--border-color--darker)"
    },
    "icon": {
      "color": {
        "base": "currentColor"
      },
      "size": {
        "smaller": "var(--np--font-size--smaller)",
        "small": "var(--np--font-size--small)",
        "base": "var(--np--font-size)",
        "large": "var(--np--font-size--large)",
        "larger": "var(--np--font-size--larger)"
      }
    }
  },
  "code": {
    "backgroundColor": {
      "base": "var(--np--background-color)"
    },
    "borderColor": {
      "base": "var(--np--border-color)"
    },
    "borderRadius": {
      "base": "var(--np--border-radius)",
      "small": "var(--np--border-radius--small)"
    },
    "boxShadow": {
      "base": "var(--np--box-shadow)"
    },
    "gap": {
      "base": "var(--np--gap)"
    },
    "fontFamily": {
      "base": "var(--np--font-family)",
      "code": "var(--np--font-family--code)"
    },
    "fontSize": {
      "smaller": "var(--np--font-size--smaller)",
      "small": "var(--np--font-size--small)",
      "base": "var(--np--font-size)"
    },
    "fontWeight": {
      "semibold": "var(--np--font-weight--semibold)"
    },
    "lineHeight": {
      "base": "var(--np--line-height)",
      "expanded": "var(--np--line-height--expanded)"
    },
    "color": {
      "base": "var(--np--color)",
      "lightest": "var(--np--color--lightest)",
      "link": "var(--np--color--link)",
      "highlight": "var(--np--color--highlight)"
    }
  },
  "icon": {
    "size": {
      "smaller": "var(--np--font-size--smaller)",
      "small": "var(--np--font-size--small)",
      "base": "var(--np--font-size)",
      "large": "var(--np--font-size--large)",
      "larger": "var(--np--font-size--larger)"
    },
    "color": {
      "base": "var(--np--color)",
      "light": "var(--np--color--light)",
      "lighter": "var(--np--color--lighter)",
      "lightest": "var(--np--color--lightest)",
      "disabled": "var(--np--color--disabled)",
      "link": "var(--np--color--link)",
      "success": "var(--np--color--success)",
      "highlight": "var(--np--color--highlight)",
      "warning": "var(--np--color--warning)",
      "error": "var(--np--color--error)"
    },
    "strokeWidth": {
      "small": "var(--np--border-width--small)",
      "base": "var(--np--border-width)",
      "large": "var(--np--border-width--large)"
    },
    "animationDuration": {
      "fast": "var(--np--animation-duration)",
      "base": "var(--np--animation-duration--slow)",
      "slow": "var(--np--animation-duration--slower)"
    },
    "viewBox": {
      "base": "0 0 16 16"
    }
  },
  "image": {
    "borderRadius": {
      "smaller": "var(--np--border-radius--smaller)",
      "small": "var(--np--border-radius--small)",
      "base": "var(--np--border-radius)",
      "large": "var(--np--border-radius--large)",
      "larger": "var(--np--border-radius--larger)"
    },
    "borderWidth": {
      "none": "var(--np--border-width--none)",
      "smaller": "var(--np--border-width--smaller)",
      "small": "var(--np--border-width--small)",
      "base": "var(--np--border-width)",
      "large": "var(--np--border-width--large)",
      "larger": "var(--np--border-width--larger)"
    },
    "borderColor": {
      "base": "var(--np--border-color)",
      "dark": "var(--np--border-color--dark)",
      "darker": "var(--np--border-color--darker)"
    },
    "backgroundSize": {
      "contain": "var(--np--background-size--contain)",
      "cover": "var(--np--background-size--cover)",
      "fill": "var(--np--background-size--fill)",
      "none": "var(--np--background-size--none)",
      "scale-down": "var(--np--background-size--scale-down)"
    },
    "objectFit": {
      "base": "cover"
    }
  },
  "ink": {
    "fontSize": {
      "smaller": "var(--np--font-size--smaller)",
      "small": "var(--np--font-size--small)",
      "base": "var(--np--font-size)",
      "large": "var(--np--font-size--large)",
      "larger": "var(--np--font-size--larger)"
    },
    "fontFamily": {
      "base": "var(--np--font-family)",
      "code": "var(--np--font-family--code)",
      "heading": "var(--np--font-family--heading)"
    },
    "fontWeight": {
      "light": "var(--np--font-weight--light)",
      "base": "var(--np--font-weight)",
      "medium": "var(--np--font-weight--medium)",
      "semibold": "var(--np--font-weight--semibold)",
      "bold": "var(--np--font-weight--bold)",
      "extrabold": "var(--np--font-weight--extrabold)",
      "black": "var(--np--font-weight--black)"
    },
    "lineHeight": {
      "condensed": "var(--np--line-height--condensed)",
      "base": "var(--np--line-height)",
      "expanded": "var(--np--line-height--expanded)"
    },
    "letterSpacing": {
      "tight": "var(--np--letter-spacing--tight)",
      "base": "var(--np--letter-spacing)",
      "wide": "var(--np--letter-spacing--wide)",
      "wider": "var(--np--letter-spacing--wider)"
    },
    "color": {
      "base": "var(--np--color)",
      "light": "var(--np--color--light)",
      "lighter": "var(--np--color--lighter)",
      "lightest": "var(--np--color--lightest)",
      "disabled": "var(--np--color--disabled)",
      "link": "var(--np--color--link)",
      "success": "var(--np--color--success)",
      "highlight": "var(--np--color--highlight)",
      "warning": "var(--np--color--warning)",
      "error": "var(--np--color--error)"
    },
    "maxWidth": {
      "prose": "65ch",
      "wide": "80ch",
      "full": "none"
    }
  },
  "input": {
    "size": {
      "smaller": "var(--np--size--smaller)",
      "small": "var(--np--size--small)",
      "base": "var(--np--size)",
      "large": "var(--np--size--large)",
      "larger": "var(--np--size--larger)"
    },
    "spacing": {
      "smaller": "calc(var(--np--size--smaller) / 2)",
      "small": "calc(var(--np--size--small) / 2)",
      "base": "calc(var(--np--size) / 2)",
      "large": "calc(var(--np--size--large) / 2)",
      "larger": "calc(var(--np--size--larger) / 2)"
    },
    "borderRadius": {
      "none": "var(--np--border-radius--none)",
      "smaller": "var(--np--border-radius--smaller)",
      "small": "var(--np--border-radius--small)",
      "base": "var(--np--border-radius)",
      "large": "var(--np--border-radius--large)",
      "larger": "var(--np--border-radius--larger)"
    },
    "borderWidth": {
      "none": "var(--np--border-width--none)",
      "smaller": "var(--np--border-width--smaller)",
      "small": "var(--np--border-width--small)",
      "base": "var(--np--border-width)",
      "large": "var(--np--border-width--large)",
      "larger": "var(--np--border-width--larger)"
    }
  },
  "lightbox": {
    "zIndex": {
      "base": "9999"
    }
  },
  "tile": {
    "backgroundColor": {
      "base": "var(--np--background-color)",
      "dark": "var(--np--background-color--dark)",
      "success": "var(--np--background-color--success)",
      "warning": "var(--np--background-color--warning)",
      "error": "var(--np--background-color--error)",
      "link": "var(--np--background-color--link)",
      "alternate": "var(--np--background-color--dark)"
    },
    "backgroundSize": {
      "contain": "var(--np--background-size--contain)",
      "cover": "var(--np--background-size--cover)",
      "fill": "var(--np--background-size--fill)",
      "none": "var(--np--background-size--none)",
      "scale-down": "var(--np--background-size--scale-down)"
    },
    "color": {
      "base": "var(--np--color)",
      "light": "var(--np--color--light)",
      "lighter": "var(--np--color--lighter)",
      "lightest": "var(--np--color--lightest)",
      "disabled": "var(--np--color--disabled)",
      "link": "var(--np--color--link)",
      "success": "var(--np--color--success)",
      "highlight": "var(--np--color--highlight)",
      "warning": "var(--np--color--warning)",
      "error": "var(--np--color--error)"
    }
  }
} as const

export default componentTokensData