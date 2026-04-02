/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        accent: '#f97316',
        neon: {
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#a855f7',
          cyan: '#06b6d4',
          orange: '#f97316',
          yellow: '#eab308',
          pink: '#ec4899',
        },
        panel: {
          dark: '#09090b',
          card: '#0c0c10',
          border: '#1c1c24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow-green 2.5s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 4s linear infinite',
      },
      boxShadow: {
        'neon-green': '0 0 5px #22c55e, 0 0 20px rgba(34,197,94,0.3)',
        'neon-blue': '0 0 5px #3b82f6, 0 0 20px rgba(59,130,246,0.3)',
        'neon-purple': '0 0 5px #a855f7, 0 0 20px rgba(168,85,247,0.3)',
        'neon-cyan': '0 0 5px #06b6d4, 0 0 20px rgba(6,182,212,0.3)',
      },
    },
  },
  plugins: [],
}
