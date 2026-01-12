/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A0A0A',
          gray: '#1A1A1A',
          blue: '#007AFF',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #FFFFFF 0%, #007AFF 100%)',
      }
    },
  },
  plugins: [],
}
