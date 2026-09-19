/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf0f0',
          100: '#ffebed',
          200: '#ffd0d4',
          300: '#fba5ab',
          400: '#f66b74',
          500: '#e53935', // Exact Mobile App Primary Red
          600: '#d32f2f',
          700: '#c62828',
          800: '#b71c1c',
          900: '#8b1d24', // Deep Brand Red
          950: '#380004',
          dark: '#5c0b11',
          black: '#380004',
        },

        gold: {
          50: '#fbf8ee',
          100: '#f5edd3',
          200: '#ebdaa8',
          300: '#dfc278',
          400: '#d4aa4d',
          500: '#c59a3f', // Exact Mobile App Royal Gold
          600: '#b38332',
          700: '#95662b',
          800: '#795027',
          900: '#644223',
        },

        cream: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f7',
          300: '#ebebf0',
          400: '#e2e2e8',
        },
        mint: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['"Cairo"', '"Tajawal"', '"Outfit"', 'sans-serif'],
        arabic: ['"Cairo"', '"Tajawal"', 'sans-serif'],
        display: ['"Cairo"', 'sans-serif'],
      },
      boxShadow: {
        'luxury-sm': '0 2px 8px -1px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.03)',
        'luxury': '0 8px 24px -4px rgba(15, 23, 42, 0.07), 0 4px 8px -2px rgba(15, 23, 42, 0.03)',
        'luxury-lg': '0 16px 36px -6px rgba(15, 23, 42, 0.1), 0 6px 12px -3px rgba(15, 23, 42, 0.05)',
        'luxury-glow': '0 8px 25px -4px rgba(136, 19, 55, 0.25)',
        'gold-glow': '0 8px 25px -4px rgba(217, 119, 6, 0.22)',
        'card-hover': '0 20px 35px -8px rgba(15, 23, 42, 0.1), 0 8px 16px -4px rgba(15, 23, 42, 0.04)',
        'cartoon-sm': '0 2px 8px -1px rgba(15, 23, 42, 0.05)',
        'cartoon': '0 6px 20px -2px rgba(15, 23, 42, 0.06)',
        'cartoon-lg': '0 12px 30px -4px rgba(15, 23, 42, 0.08)',
        'cartoon-pop': '0 8px 25px -4px rgba(136, 19, 55, 0.2)',
        'cartoon-gold': '0 8px 25px -4px rgba(217, 119, 6, 0.2)',
        'button-push': '0 2px 6px -1px rgba(136, 19, 55, 0.3)',
        'button-push-gold': '0 2px 6px -1px rgba(217, 119, 6, 0.3)',
        'button-push-charcoal': '0 2px 6px -1px rgba(15, 23, 42, 0.3)',
        'card-float': '0 16px 32px -4px rgba(15, 23, 42, 0.1)',
      },
      borderRadius: {
        '3xl': '1.25rem',
        '4xl': '1.75rem',
        '5xl': '2.25rem',
      },
    },
  },
  plugins: [],
}