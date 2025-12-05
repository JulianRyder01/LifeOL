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
        
        // UI colors
        'bg-primary': '#ffffff',
        'bg-secondary': '#f8fafc',
        'bg-tertiary': '#f1f5f9',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        'border-color': '#e2e8f0',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      }
    },
  },
  plugins: [],
}