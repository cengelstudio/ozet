/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#ff0102',
          700: '#e60000',
          800: '#cc0000',
          900: '#b30000',
        },
        red: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#ff0102',
          700: '#e60000',
          800: '#cc0000',
          900: '#b30000',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-150': {
          'animation-delay': '150ms',
        },
        '.animation-delay-300': {
          'animation-delay': '300ms',
        },
        '.animation-delay-450': {
          'animation-delay': '450ms',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
