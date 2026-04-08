/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cal-paper': '#FDFCFB',    // Soft off-white [cite: 7]
        'cal-accent': '#2C3E50',   // Deep blue [cite: 7]
        'cal-range': '#E3F2FD',    // Range highlight [cite: 29]
        'cal-today': '#FF6B6B',    // Red for today [cite: 37]
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}