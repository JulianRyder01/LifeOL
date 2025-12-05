// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - vibrant but calming
        'primary-color': '#6366f1',
        'primary-light': '#818cf8',
        'primary-dark': '#4f46e5',
        
        // Attribute colors
        'int-color': '#3b82f6',
        'str-color': '#f59e0b',
        'vit-color': '#10b981',
        'cha-color': '#ec4899',
        'eq-color': '#8b5cf6',
        'cre-color': '#f97316',
        
        // Status colors
        'hp-color': '#ef4444',
        'mp-color': '#0ea5e9',
        'exp-color': '#10b981',
        
        // Background colors
        'bg-dark': '#0f172a',
        'bg-card': '#1e293b',
        'bg-progress': '#334155',
        
        // Text colors
        'text-primary': '#f1f5f9',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      }
    }
  },
  plugins: [],
}