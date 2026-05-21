/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Crucial: This tells Tailwind where to find your classes
  ],
  
  theme: {
    extend: {
      colors: {
        'brand-purple': '#7209B7',
        'brand-lavender': '#B8BDFF',
        'brand-bg': '#F8F7FF',
        'brand-peach-light': '#FFEEDD',
        'brand-peach-dark': '#FFD8BE',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}