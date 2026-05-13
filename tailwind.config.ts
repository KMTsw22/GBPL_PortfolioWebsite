import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1a1a',
          soft: '#525252',
          muted: '#8a8a8a',
        },
        surface: '#ffffff',
        canvas: '#fafaf9',
        line: '#ececec',
        accent: {
          DEFAULT: '#2f5fff',
          soft: '#eef2ff',
        },
      },
      boxShadow: {
        card: '0 8px 24px rgba(0, 0, 0, 0.06)',
        pop: '0 24px 48px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
