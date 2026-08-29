/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand purple — the palette the public skin already commits to
        // (canvas #4c1d95 = primary-900, mdc theme #8b5cf6 = primary-500).
        // Was a zinc/gray scale, which is why "primary" buttons rendered gray
        // and views hard-coded violet-* instead of using it.
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Brand gold — the public skin's accent (#f4c977 / #d99f3f).
        gold: {
          50:  '#fdf8ec',
          100: '#faeed0',
          200: '#f8e3ae',
          300: '#f6d68f',
          400: '#f4c977',
          500: '#e9b356',
          600: '#d99f3f',
          700: '#b97f24',
          800: '#94631c',
          900: '#785016',
        },
        // Page surfaces for the dark public/admin shells, one step apart.
        surface: {
          DEFAULT: '#3b0764',
          raised:  '#581c87',
          canvas:  '#4c1d95',
          deep:    '#2e1065',
        },
        // Admin portal theme tokens. Each resolves a CSS variable set on
        // `.admin-shell` (dark by default, purple-branded under
        // [data-theme="light"]), so the same utility class renders in either
        // theme and opacity modifiers (e.g. border-admin-line/20) still work.
        admin: {
          bg:            'rgb(var(--admin-bg) / <alpha-value>)',
          surface:       'rgb(var(--admin-surface) / <alpha-value>)',
          raised:        'rgb(var(--admin-raised) / <alpha-value>)',
          sunken:        'rgb(var(--admin-sunken) / <alpha-value>)',
          fg:            'rgb(var(--admin-fg) / <alpha-value>)',
          muted:         'rgb(var(--admin-muted) / <alpha-value>)',
          subtle:        'rgb(var(--admin-subtle) / <alpha-value>)',
          faint:         'rgb(var(--admin-faint) / <alpha-value>)',
          line:          'rgb(var(--admin-line) / <alpha-value>)',
          field:         'rgb(var(--admin-field) / <alpha-value>)',
          nav:           'rgb(var(--admin-nav) / <alpha-value>)',
          accent:        'rgb(var(--admin-accent) / <alpha-value>)',
          'accent-fg':   'rgb(var(--admin-accent-fg) / <alpha-value>)',
          'accent-hover':'rgb(var(--admin-accent-hover) / <alpha-value>)',
          ok:            'rgb(var(--admin-ok) / <alpha-value>)',
          danger:        'rgb(var(--admin-danger) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
