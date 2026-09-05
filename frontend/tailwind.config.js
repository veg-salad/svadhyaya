/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F7F4EF',
          200: '#EFEADF',
        },
        border: {
          warm: '#EADEC9',
          deep: '#3D342C',
        },
        ink: {
          DEFAULT: '#1F2421',
          muted: '#6B7280',
          inverse: '#F1E9DA',
          'inverse-muted': '#B5AC9F',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F7F4EF',
          deep: '#1A1613',
          'deep-alt': '#26201C',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          dark: '#A94826',
          soft: '#E07A5F',
        },
        crimson: {
          DEFAULT: '#7B2D26',
          light: '#B85C55',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Lora', 'Georgia', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider2: '0.14em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 36, 33, 0.04), 0 4px 12px rgba(31, 36, 33, 0.04)',
        'card-dark':
          '0 1px 0 rgba(255, 240, 220, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.35)',
      },
      keyframes: {
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'spin-slow': 'spinSlow 60s linear infinite',
        'spin-slower': 'spinReverse 90s linear infinite',
      },
    },
  },
  plugins: [],
};
