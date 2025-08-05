/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#0891b2',
          600: '#0e7490',
          700: '#0f766e',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#06b6d4',
          600: '#0891b2',
        },
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        surface: '#f8fafc',
      },
    },
  },
  plugins: [],
}