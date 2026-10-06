/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAF6EC', deep: '#F1EAD8' },
        paddy: { 50: '#EEF5EA', 100: '#D9EAD0', 300: '#8FBF7A', 500: '#3F7D45', 600: '#2F6339', 700: '#244C2E', 900: '#14301F' },
        turmeric: { 300: '#F2CB63', 500: '#D9A21B' },
        soil: { 400: '#9A7656', 600: '#6B4A2F', 800: '#3E2A1A' },
        rust: { 100: '#F6DDD3', 500: '#B4472A', 700: '#862F18' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        scan: { '0%': { top: '4%' }, '100%': { top: '92%' } },
        pulseDot: { '0%,100%': { opacity: '.35' }, '50%': { opacity: '1' } },
      },
      animation: {
        scan: 'scan 3.2s ease-in-out infinite alternate',
        pulseDot: 'pulseDot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
