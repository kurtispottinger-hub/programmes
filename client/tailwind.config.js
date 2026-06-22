/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#03071a',
          900: '#060d2b',
          800: '#0a1540',
          700: '#0f1f5c',
          600: '#142878',
        },
        accent: {
          DEFAULT: '#00d4ff',
          dim: '#0099bb',
          glow: 'rgba(0, 212, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(0, 212, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
