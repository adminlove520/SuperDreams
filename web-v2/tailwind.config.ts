import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - 小溪绿
        primary: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#16a34a',
        },
        // Accent - 温暖橙
        accent: {
          DEFAULT: '#f97316',
          light: '#fdba74',
        },
        // Background
        bg: {
          base: '#09090b',
          elevated: '#18181b',
          card: '#27272a',
        },
        // Text
        text: {
          DEFAULT: '#fafafa',
          muted: '#a1a1aa',
          subtle: '#71717a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backgroundImage: {
        'gradient-dream': 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
        'gradient-card': 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
      },
    },
  },
  plugins: [],
}

export default config
