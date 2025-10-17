/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anime: {
          pink: '#FF69B4',
          purple: '#9370DB',
          blue: '#4169E1',
          green: '#32CD32',
          orange: '#FF8C00',
          red: '#FF4500'
        }
      },
      fontFamily: {
        'anime': ['Comic Sans MS', 'cursive'],
        'japanese': ['Noto Sans JP', 'sans-serif']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}