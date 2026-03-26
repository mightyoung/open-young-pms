/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0a0a0e',
        'bg-card': '#1a1a22',
        'bg-container': '#13131a',
        'accent': '#6366f1',
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'large': '18px',
      },
    },
  },
  plugins: [],
}
