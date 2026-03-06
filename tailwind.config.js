/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-120vh) rotate(720deg)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(8px, -6px)' },
          '50%': { transform: 'translate(-6px, 4px)' },
          '75%': { transform: 'translate(4px, 8px)' },
        },
        'disco-bg': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'disco-glow': {
          '0%, 100%': { boxShadow: '0 0 30px #ff0080, 0 0 60px #ff0080' },
          '33%': { boxShadow: '0 0 30px #00ff88, 0 0 60px #00ff88' },
          '66%': { boxShadow: '0 0 30px #0088ff, 0 0 60px #0088ff' },
        },
      },
      animation: {
        confetti: 'confetti 2.5s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        'disco-bg': 'disco-bg 5s ease infinite',
        'disco-glow': 'disco-glow 1.5s ease-in-out infinite',
      },
      backgroundSize: {
        'disco': '200% 200%',
      },
    },
  },
  plugins: [],
}
