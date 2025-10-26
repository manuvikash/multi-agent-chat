/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark/Goth color palette
        'dark': {
          bg: '#0a0a0f',
          card: '#13131d',
          elevated: '#1a1a28',
          border: '#2a2a3e',
        },
        'purple': {
          primary: '#8b5cf6',
          dark: '#6d28d9',
          light: '#a78bfa',
        },
        'accent': {
          pink: '#ec4899',
          cyan: '#06b6d4',
          green: '#10b981',
        }
      },
      fontFamily: {
        'display': ['"Space Grotesk"', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'retro': ['"VT323"', 'monospace'],
        'pixel': ['"Press Start 2P"', 'monospace'],
        'mono': ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}


