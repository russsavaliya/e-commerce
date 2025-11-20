/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.jsx",
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      fontSize: {
        base: '16px',
        sm: '14px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
        'slide-down': {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}

