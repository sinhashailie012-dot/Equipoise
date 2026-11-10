/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4EFE6',
        card: {
          DEFAULT: '#FBF8F2',
          subtle: '#F7F3EB',
          hover: '#F5EEE2',
        },
        ink: {
          primary: '#1E2A26',
          secondary: '#5E6C65',
          muted: '#848F89',
          light: '#A3ACA7',
        },
        border: {
          subtle: '#E3DCCE',
          muted: '#EAE4D8',
          dark: '#2E5043',
        },
        brand: {
          50: '#EFF5F1',
          100: '#E4EDE8',
          200: '#C2D9CF',
          500: '#3D6C5C',
          600: '#355C4E',
          700: '#2B4E41',
          800: '#234236',
          900: '#1A332B',
          950: '#132620',
        },
        ochre: {
          50: '#FDFBF7',
          100: '#EFE4C9',
          400: '#DFB54E',
          500: '#D4A537',
          600: '#C28835',
          700: '#9E6822',
        },
        status: {
          spare: {
            bg: '#DEE8E6',
            text: '#2D6166',
            dot: '#4F7A7F',
            bar: '#4F7A7F',
          },
          balanced: {
            bg: '#E6EBDF',
            text: '#2E5E3B',
            dot: '#488C56',
            bar: '#659670',
          },
          stretched: {
            bg: '#EFE4C9',
            text: '#7A5B1E',
            dot: '#D4A537',
            bar: '#D4A537',
          },
          overloaded: {
            bg: '#F0DED5',
            text: '#8C3E23',
            dot: '#C3542F',
            bar: '#C3542F',
          },
          critical: {
            bg: '#EADADF',
            text: '#832238',
            dot: '#B93856',
            bar: '#B93856',
          },
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(30, 42, 38, 0.04)',
        'card': '0 1px 3px 0 rgba(30, 42, 38, 0.05), 0 1px 2px -1px rgba(30, 42, 38, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'focus-ochre': '0 0 0 2px #F4EFE6, 0 0 0 4px #D4A537',
      },
    },
  },
  plugins: [],
}

