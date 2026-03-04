/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Acento principal: naranja quemado (Hermès-like)
        gold: {
          50:  '#FFF4EE',
          100: '#FFE4CC',
          200: '#FFC893',
          300: '#FFA05A',
          400: '#EA580C',
          500: '#C2410C',
          600: '#9A3412',
          700: '#7C2D12',
          800: '#5C1700',
          900: '#3D0E00',
        },
        cream: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#0F0F0E',
          300: '#3D3D3D',
        },
        obsidian: {
          800: '#FFFFFF',
          900: '#F9F8F6',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold': '0 0 30px rgba(194, 65, 12, 0.15)',
        'gold-lg': '0 0 60px rgba(194, 65, 12, 0.20)',
        'dark': '0 4px 24px rgba(0,0,0,0.07)',
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
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
