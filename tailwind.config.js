/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        grape: {
          0: '#f8f0fc',
          1: '#f3d9fa',
          2: '#eebefa',
          3: '#e599f7',
          4: '#da77f2',
          5: '#cc5de8',
          6: '#be4bdb',
          7: '#ae3ec9',
          8: '#9c36b5',
          9: '#862e9c',
        },
        violet: {
          0: '#f3f0ff',
          1: '#e5dbff',
          2: '#d0bfff',
          3: '#b197fc',
          4: '#9775fa',
          5: '#845ef7',
          6: '#7950f2',
          7: '#7048e8',
          8: '#6741d9',
          9: '#5f3dc4',
        },
        dark: {
          0: '#C1C2C5',
          1: '#A6A7AB',
          2: '#909296',
          3: '#5c5f66',
          4: '#373A40',
          5: '#2C2E33',
          6: '#25262b',
          7: '#1A1B1E',
          8: '#141517',
          9: '#101113',
        },
      },
      backgroundImage: {
        'mantine-splash': 'linear-gradient(10deg, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.backdrop-glass': {
          '-webkit-backdrop-filter': 'blur(12px) saturate(150%)',
          'will-change': 'backdrop-filter',
          'isolation': 'isolate',
        },
      });
    },
  ],
};