/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--theme-font-family)',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif'
        ],
        theme: ['var(--theme-font-family)', 'system-ui', 'sans-serif']
      },
      colors: {
        'theme-text': {
          primary: 'var(--theme-text-primary)',
          secondary: 'var(--theme-text-secondary)',
          muted: 'var(--theme-text-muted)',
          light: 'var(--theme-text-light)',
          'light-secondary': 'var(--theme-text-light-secondary)',
          'light-muted': 'var(--theme-text-light-muted)',
          heading: 'var(--theme-heading-color)'
        },
        'theme-link': 'var(--theme-link-color)',
        indigo: {
          50: 'rgb(var(--theme-primary-50) / <alpha-value>)',
          100: 'rgb(var(--theme-primary-100) / <alpha-value>)',
          200: 'rgb(var(--theme-primary-200) / <alpha-value>)',
          300: 'rgb(var(--theme-primary-300) / <alpha-value>)',
          400: 'rgb(var(--theme-primary-400) / <alpha-value>)',
          500: 'rgb(var(--theme-primary-500) / <alpha-value>)',
          600: 'rgb(var(--theme-primary-600) / <alpha-value>)',
          700: 'rgb(var(--theme-primary-700) / <alpha-value>)',
          800: 'rgb(var(--theme-primary-800) / <alpha-value>)',
          900: 'rgb(var(--theme-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary-500) / <alpha-value>)'
        },
        sky: {
          50: 'rgb(var(--theme-primary-50) / <alpha-value>)',
          100: 'rgb(var(--theme-primary-100) / <alpha-value>)',
          200: 'rgb(var(--theme-primary-200) / <alpha-value>)',
          300: 'rgb(var(--theme-primary-300) / <alpha-value>)',
          400: 'rgb(var(--theme-primary-400) / <alpha-value>)',
          500: 'rgb(var(--theme-primary-500) / <alpha-value>)',
          600: 'rgb(var(--theme-primary-600) / <alpha-value>)',
          700: 'rgb(var(--theme-primary-700) / <alpha-value>)',
          800: 'rgb(var(--theme-primary-800) / <alpha-value>)',
          900: 'rgb(var(--theme-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary-500) / <alpha-value>)'
        },
        blue: {
          50: 'rgb(var(--theme-primary-50) / <alpha-value>)',
          100: 'rgb(var(--theme-primary-100) / <alpha-value>)',
          200: 'rgb(var(--theme-primary-200) / <alpha-value>)',
          300: 'rgb(var(--theme-primary-300) / <alpha-value>)',
          400: 'rgb(var(--theme-primary-400) / <alpha-value>)',
          500: 'rgb(var(--theme-primary-500) / <alpha-value>)',
          600: 'rgb(var(--theme-primary-600) / <alpha-value>)',
          700: 'rgb(var(--theme-primary-700) / <alpha-value>)',
          800: 'rgb(var(--theme-primary-800) / <alpha-value>)',
          900: 'rgb(var(--theme-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary-500) / <alpha-value>)'
        },
        cyan: {
          50: 'rgb(var(--theme-primary-50) / <alpha-value>)',
          100: 'rgb(var(--theme-primary-100) / <alpha-value>)',
          200: 'rgb(var(--theme-primary-200) / <alpha-value>)',
          300: 'rgb(var(--theme-primary-300) / <alpha-value>)',
          400: 'rgb(var(--theme-primary-400) / <alpha-value>)',
          500: 'rgb(var(--theme-primary-500) / <alpha-value>)',
          600: 'rgb(var(--theme-primary-600) / <alpha-value>)',
          700: 'rgb(var(--theme-primary-700) / <alpha-value>)',
          800: 'rgb(var(--theme-primary-800) / <alpha-value>)',
          900: 'rgb(var(--theme-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary-500) / <alpha-value>)'
        },
        purple: {
          50: 'rgb(var(--theme-primary-50) / <alpha-value>)',
          100: 'rgb(var(--theme-primary-100) / <alpha-value>)',
          200: 'rgb(var(--theme-primary-200) / <alpha-value>)',
          300: 'rgb(var(--theme-primary-300) / <alpha-value>)',
          400: 'rgb(var(--theme-primary-400) / <alpha-value>)',
          500: 'rgb(var(--theme-primary-500) / <alpha-value>)',
          600: 'rgb(var(--theme-primary-600) / <alpha-value>)',
          700: 'rgb(var(--theme-primary-700) / <alpha-value>)',
          800: 'rgb(var(--theme-primary-800) / <alpha-value>)',
          900: 'rgb(var(--theme-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary-500) / <alpha-value>)'
        },
        primary: {
          50: 'rgb(var(--theme-primary-50) / <alpha-value>)',
          100: 'rgb(var(--theme-primary-100) / <alpha-value>)',
          200: 'rgb(var(--theme-primary-200) / <alpha-value>)',
          300: 'rgb(var(--theme-primary-300) / <alpha-value>)',
          400: 'rgb(var(--theme-primary-400) / <alpha-value>)',
          500: 'rgb(var(--theme-primary-500) / <alpha-value>)',
          600: 'rgb(var(--theme-primary-600) / <alpha-value>)',
          700: 'rgb(var(--theme-primary-700) / <alpha-value>)',
          800: 'rgb(var(--theme-primary-800) / <alpha-value>)',
          900: 'rgb(var(--theme-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--theme-primary-500) / <alpha-value>)'
        }
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        999: '999'
      }
    },
  },
  plugins: [],
}
