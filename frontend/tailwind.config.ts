export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        surface: '#f9f9ff',
        'surface-dim': '#cfdaf1',
        'surface-bright': '#f9f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f3ff',
        'surface-container': '#e7eeff',
        'surface-container-high': '#dee8ff',
        'surface-container-highest': '#d8e3fa',
        'surface-variant': '#d8e3fa',
        'on-surface': '#111c2c',
        'on-surface-variant': '#42474f',
        'inverse-surface': '#263142',
        'inverse-on-surface': '#ebf1ff',
        outline: '#727780',
        'outline-variant': '#c2c7d1',
        background: '#f9f9ff',
        'on-background': '#111c2c',

        primary: '#00355f',
        'on-primary': '#ffffff',
        'primary-container': '#0f4c81',
        'on-primary-container': '#8ebdf9',
        'inverse-primary': '#a0c9ff',
        'primary-fixed': '#d2e4ff',
        'primary-fixed-dim': '#a0c9ff',
        'on-primary-fixed': '#001c37',
        'on-primary-fixed-variant': '#07497d',

        secondary: '#5a5f62',
        'on-secondary': '#ffffff',
        'secondary-container': '#dce0e4',
        'on-secondary-container': '#5e6367',
        'secondary-fixed': '#dfe3e7',
        'secondary-fixed-dim': '#c3c7cb',
        'on-secondary-fixed': '#171c1f',
        'on-secondary-fixed-variant': '#43474b',

        tertiary: '#6e0011',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#911923',
        'on-tertiary-container': '#ffa09d',
        'tertiary-fixed': '#ffdad8',
        'tertiary-fixed-dim': '#ffb3b0',
        'on-tertiary-fixed': '#410006',
        'on-tertiary-fixed-variant': '#8c1520',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        ambient: '0px 10px 25px -5px rgba(15, 76, 129, 0.1)',
      },
      maxWidth: {
        container: '1280px',
      },
      keyframes: {
        shine: {
          '100%': { left: '125%' },
        },
      },
      animation: {
        shine: 'shine 1.5s infinite',
      },
    },
  },
} satisfies import('tailwindcss').Config;
