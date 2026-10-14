/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      colors: {
        // Editorial cream tones
        cream: {
          50: '#FDFCFA',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EBE3D5',
          400: '#DCD2BF',
        },

        // Burgundy accent
        burgundy: {
          50: '#F7ECEC',
          100: '#EBD5D5',
          200: '#D6ABAB',
          300: '#B47E7E',
          400: '#9B5656',
          500: '#8B3A3A',
          600: '#6E2D2D',
          700: '#542222',
          800: '#3A1717',
          900: '#220E0E',
        },

        // Ink (text) scale
        ink: {
          50: '#F7F7F7',
          100: '#EDEDED',
          200: '#D9D9D9',
          300: '#B0B0B0',
          400: '#9A9A9A',
          500: '#6B6B6B',
          600: '#4D4D4D',
          700: '#333333',
          800: '#1A1A1A',
          900: '#0A0A0A',
        },

        // Line / borders
        line: {
          soft: '#F0EBE3',
          DEFAULT: '#E8E3DC',
          strong: '#D9D1C4',
        },
      },

      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },

      letterSpacing: {
        'kicker': '0.15em',
        'wider': '0.08em',
      },

      maxWidth: {
        'editorial': '1400px',
      },

      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },

  plugins: [],
};