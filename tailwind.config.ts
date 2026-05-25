import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kizuna-bg': '#0d0d12',
        'kizuna-surface': '#16161e',
        'kizuna-border': 'rgba(255,255,255,0.08)',
        'kizuna-purple': '#8b7ff0',
        'kizuna-purple-muted': 'rgba(139,127,240,0.15)',
        'kizuna-text': '#ffffff',
        'kizuna-text-secondary': 'rgba(255,255,255,0.45)',
        'kizuna-green': '#5ccb9b',
        'coral': '#FF6B6B',
        'coral-dark': '#FF5252',
      },
    },
  },
  plugins: [],
};

export default config;
