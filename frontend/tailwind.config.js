/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Space Grotesk"', 'system-ui', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: { ink: '#0f1020', lab: { 1: '#ff5d8f', 2: '#ffb703', 3: '#3ddc97', 4: '#38bdf8', 5: '#a78bfa', 6: '#fb7185', 7: '#2dd4bf' } },
    },
  },
  plugins: [],
}
