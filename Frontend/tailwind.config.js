// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'], // Added for ancient scroll
      },
      colors: {
        'dark-bg': '#1a1a2e',
        'dark-card': '#272740',
        'dark-text-light': '#E0E0E0',
        'dark-text-medium': '#B0B0C0',
        'dark-border': '#444466',
        'accent-primary': '#6A05AD',
        'accent-secondary': '#8C06E3',
        'accent-gradient-start': '#6A05AD',
        'accent-gradient-end': '#8C06E3',
        'light-bg': '#F8F9FA',
        'light-card': '#FFFFFF',
        'light-text': '#333333',
        'light-border': '#E0E0E0',
        'parchment-light': '#fefbe9',
        'parchment-medium': '#ede0c8',
        'parchment-dark-text': '#5a4a3e',
        'parchment-placeholder': '#7d6c5e',
        'primary': '#FFD700', // Added a vibrant yellow as 'primary' color for Navbar highlights
      },
      fontSize: {
        'xxs': '0.65rem', // Define xxs for small text in cards
      },
      boxShadow: {
        'glow': '0 0px 25px rgba(106, 5, 173, 0.6), 0 0px 50px rgba(106, 5, 173, 0.4)',
        'inner-glow': 'inset 0 0 10px rgba(106, 5, 173, 0.3)',
      },
      // IMPORTANT: Define the custom animation for the Navbar button
      animation: {
        'gradient-xy': 'gradient-xy 4s ease infinite',
      },
      keyframes: {
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
}
