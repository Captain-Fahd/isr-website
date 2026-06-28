/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        isr: {
          cream: '#EAE3D8',
          'light-blue': '#98AEA8',
          'yellow': '#EBE8CB',
          turquoise: '#509589',
          'dark-red': '#5B0B05',
          'bright-red': '#D43325',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
