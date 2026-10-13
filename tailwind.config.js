/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
     fontFamily: {
  'playfair': ['"Playfair Display"', 'serif'],
  'cormorant': ['"Cormorant Garamond"', 'serif'],
  'dm': ['"DM Sans"', 'sans-serif'],
  'serif': ['"Playfair Display"', 'serif'],
},

      colors: {
        gold: {
          50: "#fef9e7",
          100: "#fcf3d0",
          200: "#f9e7a1",
          300: "#f6db72",
          400: "#f3cf43",
          500: "#f0c314",
          600: "#c09c10",
          700: "#90750c",
          800: "#604e08",
          900: "#302704",
        },

        luxury: {
          50: "#f8f6f4",
          100: "#f0ede8",
          200: "#e1dbd1",
          300: "#d2c9ba",
          400: "#c3b7a3",
          500: "#b4a58c",
          600: "#908470",
          700: "#6c6354",
          800: "#484238",
          900: "#24211c",
        },
      },

      backgroundImage: {
        "gradient-radial":
          "radial-gradient(var(--tw-gradient-stops))",

        "gradient-luxury":
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },

        glow: {
          "0%, 100%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0.5,
          },
        },

        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },

        slideUp: {
          "0%": {
            transform: "translateY(20px)",
            opacity: 0,
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1,
          },
        },

        slideDown: {
          "0%": {
            transform: "translateY(-20px)",
            opacity: 0,
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1,
          },
        },

        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
      },
    },
  },

  plugins: [],
};