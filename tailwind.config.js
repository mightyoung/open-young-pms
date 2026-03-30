/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#115cb9',
        'primary-light': '#3377cc',
        'primary-dark': '#0d4a9a',
        'bg-main': '#f5f7fa',
        'bg-card': '#ffffff',
        'bg-surface': '#ffffff',
        'border': '#e5e7eb',
        'text-primary': '#1a1a2e',
        'text-secondary': '#5f5f61',
        'text-muted': '#8c8c8c',
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'manrope': ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '8px',
        'large': '12px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(17,92,185,0.1)',
        'elevated': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
