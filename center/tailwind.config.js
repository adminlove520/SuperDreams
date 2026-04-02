/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00f0ff',
          pink: '#ff2d78',
          purple: '#b44dff',
          green: '#39ff14',
          yellow: '#ffe600',
          dark: '#0a0a0f',
          darker: '#050508',
          panel: '#0d0d14',
          border: '#1a1a2e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'data-flow': 'data-flow 2s linear infinite',
        'border-pulse': 'border-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        'data-flow': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        'border-pulse': {
          '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.2)' },
          '50%': { borderColor: 'rgba(0, 240, 255, 0.6)' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00f0ff, 0 0 20px rgba(0,240,255,0.3)',
        'neon-pink': '0 0 5px #ff2d78, 0 0 20px rgba(255,45,120,0.3)',
        'neon-purple': '0 0 5px #b44dff, 0 0 20px rgba(180,77,255,0.3)',
        'neon-green': '0 0 5px #39ff14, 0 0 20px rgba(57,255,20,0.3)',
      },
    },
  },
  plugins: [],
}
