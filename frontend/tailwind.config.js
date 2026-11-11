/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#F4EFE6',
        surface: {
          DEFAULT: '#FBF8F2',
          subtle: '#F7F3EB',
          hover: '#F2ECE0',
        },
        border: {
          DEFAULT: '#DDD4C4',
          subtle: '#DDD4C4',
          focus: '#B8862F',
        },
        ink: {
          DEFAULT: '#1E2A26',
          primary: '#1E2A26',
          secondary: '#6B6A60',
          muted: '#8D8C82',
        },
        forest: {
          DEFAULT: '#234236',
          hover: '#1B352B',
          dark: '#162B23',
          light: '#2E5445',
          subtle: '#EAEFEA',
        },
        ochre: {
          DEFAULT: '#B8862F',
          accent: '#B8862F',
          stretched: '#D4A537',
          hover: '#9E7124',
          subtle: '#FAF4E8',
        },
        status: {
          balanced: '#7E9C7A',
          stretched: '#D4A537',
          overloaded: '#C4613F',
          critical: '#7A2E3A',
          spare: '#4F7A7F',
        },
        sage: '#7E9C7A',
        terracotta: '#C4613F',
        oxblood: '#7A2E3A',
        teal: '#4F7A7F',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"Instrument Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(30, 42, 38, 0.04)',
        card: '0 1px 3px 0 rgba(30, 42, 38, 0.05)',
        modal: '0 10px 25px -5px rgba(30, 42, 38, 0.15), 0 8px 10px -6px rgba(30, 42, 38, 0.1)',
        'focus-ochre': '0 0 0 2px #B8862F',
      },
    },
  },
  plugins: [],
}
