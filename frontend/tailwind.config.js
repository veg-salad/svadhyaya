/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F7F4EF',
        },
        border: {
          warm: '#EADEC9',
        },
        ink: {
          DEFAULT: '#1F2421',
          muted: '#6B7280',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          dark: '#A94826',
        },
        crimson: {
          DEFAULT: '#7B2D26',
        },
        saffron: {
          DEFAULT: '#E07A5F',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 36, 33, 0.04), 0 4px 12px rgba(31, 36, 33, 0.04)',
      },
    },
  },
  plugins: [],
};
