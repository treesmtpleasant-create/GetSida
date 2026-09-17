/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sida: {
          green: '#2A9D6E',
          'green-dark': '#1d7a54',
          'green-light': '#e8f8f2',
          cream: '#F7F7F5',
          yellow: '#FCD34D',
          'yellow-dark': '#f0b429',
          red: '#ff3962',
          'red-light': '#ffe8ec',
          navy: '#1B2B4B',
          'navy-2': '#243352',
          'navy-3': '#2d3f61',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      }
    }
  },
  plugins: []
}
