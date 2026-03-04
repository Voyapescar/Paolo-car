/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Acento principal: rojo racing
        gold: {
          50:  '#FFF0F0',
          100: '#FECACA',
          200: '#FCA5A5',
          300: '#F87171',
          400: '#EF4444',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        cream: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#1a1a1a',
          300: '#333333',
        },
        obsidian: {
          800: '#1e1e1e',
          900: '#111111',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 30px rgba(194, 65, 12, 0.15)',
        'gold-lg': '0 0 60px rgba(194, 65, 12, 0.20)',
        'dark': '0 4px 24px rgba(0,0,0,0.07)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.10), 0 32px 64px rgba(0,0,0,0.07)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out both',
        'fade-in': 'fadeIn 0.6s ease-out both',
        'line-grow': 'lineGrow 0.5s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        lineGrow: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}
