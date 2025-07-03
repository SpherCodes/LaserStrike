/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'access-granted': 'accessGranted 1s forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100vh)' },
          '100%': { transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        },
        accessGranted: {
          '0%': { backgroundColor: 'rgb(239 68 68)' },
          '100%': { backgroundColor: 'rgb(34 197 94)', borderColor: 'rgb(74 222 128 / 0.3)' }
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 0, 0, 0.1) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
