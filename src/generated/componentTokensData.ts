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
      "subtle": "var(--np--border-color--subtle)",
      "strong": "var(--np--border-color--strong)",
      "stronger": "var(--np--border-color--stronger)",
      "success": "var(--np--border-color--success)",
      "highlight": "var(--np--border-color--highlight)",
      "warning": "var(--np--border-color--warning)",
      "error": "var(--np--border-color--error)",
      "link": "var(--np--border-color--link)"
    },
    "icon": {
      "color": {
        "base": "currentColor",
        "hover": "var(--np--button--icon--color)",
        "focus": "var(--np--button--icon--color)",
        "active": "var(--np--button--icon--color)"
      },
      "size": {
        "smaller": "var(--np--font-size--smaller)",
        "small": "var(--np--font-size--small)",
        "base": "var(--np--font-size)",
        "large": "var(--np--font-size--large)",
        "larger": "var(--np--font-size--larger)"
      }
    },
    "animationDuration": {
      "none": "0s",
      "faster": "var(--np--animation-duration--faster)",
      "fast": "var(--np--animation-duration--fast)",
      "base": "var(--np--animation-duration--fast)",
      "slow": "var(--np--animation-duration--slow)",
      "slower": "var(--np--animation-duration--slower)"
    },
    "animationEasing": {
      "base": "var(--np--animation-easing)"
    },
    "selected": {
      "borderColor": {
        "base": "var(--np--border-color--stronger)"
      }
    },
    "focusRing": {
      "width": {
        "base": "var(--np--border-width--large)"
      },
      "color": {
        "base": "var(--np--color--link)"
      },
      "offset": {
        "base": "var(--np--gap--smaller)"
      }
    }
  },
  "calendar": {
    "cell": {
      "size": {
        "smaller": "var(--np--size--smaller)",
        "small": "var(--np--size--small)",
        "base": "var(--np--size)",
        "large": "var(--np--size--large)",
        "larger": "var(--np--size--larger)"
      }
    },
    "gap": {
      "base": "var(--np--gap--smaller)"
    },
    "color": {
      "base": "var(--np--color)",
      "today": "var(--np--color--link)",
      "selected": "var(--np--background-color)",
      "range": "var(--np--color)",
      "disabled": "var(--np--color--disabled)"
    },
    "backgroundColor": {
      "base": "var(--np--background-color)",
      "selected": "var(--np--color--link)",
      "range": "var(--np--background-color--link)"
    },
    "borderColor": {
      "today": "var(--np--border-color--link)"
    }
  },
  "checkbox": {
    "size": {
      "smaller": "14px",
      "small": "16px",
      "base": "20px",
      "large": "24px",
      "larger": "28px"
    },
    "backgroundColor": {
      "unchecked": "var(--np--background-color)",
      "base": "var(--np--color)",
      "link": "var(--np--color--link)",
      "success": "var(--np--color--success)",
      "highlight": "var(--np--color--highlight)",
      "warning": "var(--np--color--warning)",
      "error": "var(--np--color--error)"
    },
    "borderColor": {
      "base": "var(--np--border-color)",
      "subtle": "var(--np--border-color--subtle)",
      "strong": "var(--np--border-color--strong)",
      "stronger": "var(--np--border-color--stronger)",
      "success": "var(--np--border-color--success)",
      "highlight": "var(--np--border-color--highlight)",
      "warning": "var(--np--border-color--warning)",
      "error": "var(--np--border-color--error)",
      "link": "var(--np--border-color--link)"
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
    },
    "icon": {
      "color": {
        "base": "var(--np--color--inverse)"
      },
      "size": {
        "smaller": "10px",
        "small": "12px",
        "base": "14px",
        "large": "18px",
        "larger": "20px"
      }
    },
    "disabledOpacity": {
      "base": "0.5"
    },
    "focusRing": {
      "width": {
        "base": "var(--np--border-width--large)"
      },
      "color": {
        "base": "var(--np--color--link)"
      },
      "offset": {
        "base": "var(--np--gap--smaller)"
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
  "dialog": {
    "backgroundColor": {
      "base": "var(--np--background-color--raised)"
    },
    "color": {
      "base": "var(--np--color)"
    },
    "borderRadius": {
      "base": "var(--np--border-radius)"
    },
    "boxShadow": {
      "base": "var(--np--box-shadow--large)"
    },
    "width": {
      "base": "fit-content"
    },
    "maxWidth": {
      "base": "calc(100% - 6px - 2em)"
    },
    "padding": {
      "base": "var(--np--gap)"
    },
    "gap": {
      "base": "var(--np--gap)"
    },
    "backdrop": {
      "backgroundColor": {
        "base": "rgba(0, 0, 0, 0.1)"
      }
    },
    "title": {
      "fontSize": {
        "base": "var(--np--font-size--large)"
      },
      "fontWeight": {
        "base": "var(--np--font-weight--semibold)"
      }
    },
    "description": {
      "color": {
        "base": "var(--np--color--light)"
      }
    },
    "actions": {
      "gap": {
        "base": "var(--np--gap--small)"
      }
    }
  },
  "field": {
    "gap": {
      "label": "var(--np--gap--small)",
      "description": "var(--np--gap--smaller)",
      "error": "var(--np--gap--smaller)"
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
      "disabled": "var(--np--icon--color--lighter)",
      "muted": "var(--np--color--lightest)",
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
    "strokeWidthScale": {
      "base": "var(--np--stroke-width-scale)"
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
    },
    "borderColor": {
      "base": "var(--np--border-color)",
      "subtle": "var(--np--border-color--subtle)",
      "strong": "var(--np--border-color--strong)",
      "stronger": "var(--np--border-color--stronger)",
      "success": "var(--np--border-color--success)",
      "highlight": "var(--np--border-color--highlight)",
      "warning": "var(--np--border-color--warning)",
      "error": "var(--np--border-color--error)",
      "link": "var(--np--border-color--link)"
    },
    "backgroundSize": {
      "base": "var(--np--background-size)",
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
      "single": "var(--np--line-height--single)",
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
    },
    "backgroundColor": {
      "base": "var(--np--background-color)",
      "raised": "var(--np--background-color--raised)",
      "success": "var(--np--background-color--success)",
      "highlight": "var(--np--background-color--highlight)",
      "warning": "var(--np--background-color--warning)",
      "error": "var(--np--background-color--error)",
      "link": "var(--np--background-color--link)"
    },
    "borderColor": {
      "base": "var(--np--border-color)",
      "subtle": "var(--np--border-color--subtle)",
      "strong": "var(--np--border-color--strong)",
      "stronger": "var(--np--border-color--stronger)",
      "success": "var(--np--border-color--success)",
      "highlight": "var(--np--border-color--highlight)",
      "warning": "var(--np--border-color--warning)",
      "error": "var(--np--border-color--error)",
      "link": "var(--np--border-color--link)"
    },
    "width": {
      "2": "2ch",
      "3": "3ch",
      "4": "4ch",
      "5": "5ch",
      "10": "10ch",
      "20": "20ch",
      "full": "100%"
    },
    "fontSize": {
      "base": "max(16px, var(--np--font-size))"
    },
    "focusRing": {
      "width": {
        "base": "var(--np--border-width--large)"
      },
      "color": {
        "base": "var(--np--color--link)"
      },
      "offset": {
        "base": "var(--np--gap--smaller)"
      }
    },
    "fontFamily": {
      "base": "var(--np--font-family)"
    }
  },
  "lightbox": {
    "zIndex": {
      "base": "9999"
    },
    "focusRing": {
      "width": {
        "base": "var(--np--border-width--large)"
      },
      "color": {
        "base": "var(--np--color--link)"
      },
      "offset": {
        "base": "var(--np--gap--smaller)"
      }
    }
  },
  "line": {
    "borderColor": {
      "base": "var(--np--border-color)",
      "subtle": "var(--np--border-color--subtle)",
      "strong": "var(--np--border-color--strong)",
      "stronger": "var(--np--border-color--stronger)",
      "success": "var(--np--border-color--success)",
      "highlight": "var(--np--border-color--highlight)",
      "warning": "var(--np--border-color--warning)",
      "error": "var(--np--border-color--error)",
      "link": "var(--np--border-color--link)"
    },
    "rimColor": {
      "base": "hsla(0, 0%, 100%, 1)"
    },
    "width": {
      "base": "4px"
    },
    "rimWidth": {
      "base": "1.5px"
    },
    "dashLength": {
      "base": "18px"
    },
    "gap": {
      "base": "5px"
    }
  },
  "list": {
    "padding": {
      "block": {
        "smaller": "calc(var(--np--size--smaller) / 4)",
        "small": "calc(var(--np--size--small) / 4)",
        "base": "calc(var(--np--size) / 4)",
        "large": "calc(var(--np--size--large) / 4)",
        "larger": "calc(var(--np--size--larger) / 4)"
      },
      "inline": {
        "smaller": "calc(var(--np--size--smaller) / 2)",
        "small": "calc(var(--np--size--small) / 2)",
        "base": "calc(var(--np--size) / 2)",
        "large": "calc(var(--np--size--large) / 2)",
        "larger": "calc(var(--np--size--larger) / 2)"
      }
    },
    "gap": {
      "base": "var(--np--gap--small)"
    },
    "divider": {
      "color": {
        "base": "var(--np--border-color--subtle)"
      },
      "width": {
        "base": "var(--np--border-width)"
      }
    },
    "maxHeight": {
      "base": "calc(var(--np--size) * 6)"
    },
    "backgroundColor": {
      "base": "transparent",
      "active": "var(--np--border-color)",
      "selected": "var(--np--background-color--link)"
    },
    "color": {
      "base": "var(--np--color)",
      "selected": "var(--np--color--link)",
      "disabled": "var(--np--color--disabled)"
    }
  },
  "logo": {
    "height": {
      "base": "64"
    },
    "gap": {
      "base": "0.121"
    },
    "color": {
      "base": "var(--np--color--day)"
    }
  },
  "popover": {
    "offset": {
      "base": "var(--np--gap--small)"
    },
    "borderRadius": {
      "base": "var(--np--border-radius)"
    },
    "boxShadow": {
      "base": "var(--np--box-shadow--large)"
    },
    "zIndex": {
      "base": "var(--np--z-index--high)"
    },
    "maxHeight": {
      "base": "calc(var(--np--size) * 6)"
    }
  },
  "select": {
    "chevron": {
      "size": {
        "smaller": "var(--np--font-size--smaller)",
        "small": "var(--np--font-size--small)",
        "base": "var(--np--font-size)",
        "large": "var(--np--font-size--large)",
        "larger": "var(--np--font-size--larger)"
      }
    }
  },
  "tabs": {
    "padding": {
      "smaller": "var(--np--gap--smaller) var(--np--gap--small)",
      "small": "var(--np--gap--smaller) var(--np--gap--small)",
      "base": "var(--np--gap--small) var(--np--gap)",
      "large": "var(--np--gap--small) var(--np--gap)",
      "larger": "var(--np--gap) var(--np--gap--large)"
    },
    "gap": {
      "smaller": "var(--np--gap--smaller)",
      "small": "var(--np--gap--smaller)",
      "base": "var(--np--gap--small)",
      "large": "var(--np--gap--small)",
      "larger": "var(--np--gap)"
    },
    "fontSize": {
      "smaller": "var(--np--font-size--smaller)",
      "small": "var(--np--font-size--small)",
      "base": "var(--np--font-size)",
      "large": "var(--np--font-size--large)",
      "larger": "var(--np--font-size--larger)"
    },
    "color": {
      "base": "var(--np--color--lighter)",
      "selected": "var(--np--color)"
    },
    "borderColor": {
      "base": "var(--np--border-color)"
    },
    "borderWidth": {
      "base": "var(--np--border-width)"
    },
    "indicator": {
      "color": {
        "base": "var(--np--color--link)"
      },
      "width": {
        "base": "var(--np--border-width--large)"
      }
    },
    "disabledOpacity": {
      "base": "0.5"
    },
    "focusRing": {
      "width": {
        "base": "var(--np--border-width--large)"
      },
      "color": {
        "base": "var(--np--color--link)"
      },
      "offset": {
        "base": "var(--np--gap--smaller)"
      }
    },
    "pill": {
      "borderRadius": {
        "base": "var(--np--border-radius--larger)"
      },
      "borderWidth": {
        "base": "var(--np--border-width)"
      },
      "borderColor": {
        "base": "transparent",
        "hover": "var(--np--border-color)",
        "selected": "var(--np--border-color--stronger)"
      }
    }
  },
  "tile": {
    "backgroundColor": {
      "base": "var(--np--background-color)",
      "raised": "var(--np--background-color--raised)",
      "success": "var(--np--background-color--success)",
      "highlight": "var(--np--background-color--highlight)",
      "warning": "var(--np--background-color--warning)",
      "error": "var(--np--background-color--error)",
      "link": "var(--np--background-color--link)"
    },
    "backgroundSize": {
      "base": "var(--np--background-size)",
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
  },
  "toggle": {
    "track": {
      "width": {
        "smaller": "28px",
        "small": "32px",
        "base": "40px",
        "large": "48px",
        "larger": "56px"
      },
      "height": {
        "smaller": "16px",
        "small": "18px",
        "base": "22px",
        "large": "26px",
        "larger": "30px"
      },
      "backgroundColor": {
        "base": "var(--np--border-color--strong)",
        "checked": "var(--np--color--link)"
      }
    },
    "thumb": {
      "size": {
        "smaller": "12px",
        "small": "14px",
        "base": "18px",
        "large": "22px",
        "larger": "26px"
      },
      "backgroundColor": {
        "base": "var(--np--background-color)"
      }
    },
    "gap": {
      "base": "var(--np--gap--small)"
    },
    "disabledOpacity": {
      "base": "0.5"
    },
    "transitionDuration": {
      "base": "var(--np--animation-duration--fast)"
    },
    "focusRing": {
      "width": {
        "base": "var(--np--border-width--large)"
      },
      "color": {
        "base": "var(--np--color--link)"
      },
      "offset": {
        "base": "var(--np--gap--smaller)"
      }
    }
  }
} as const

export default componentTokensData