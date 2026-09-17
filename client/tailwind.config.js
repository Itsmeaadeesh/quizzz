/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#22C3F4',
          'blue-dark': '#1C8FBF',
          'blue-deep': '#0E7490',
          'blue-light': '#EBF9FE',
          'blue-subtle': '#F4FBFE',
          orange: '#FAA722',
          'orange-hover': '#E59616',
          'orange-light': '#FEF6E9',
          ink: '#14181F',
          muted: '#5B6472',
          border: '#E7ECF1',
          bg: '#FAFCFD',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 24, 31, 0.05)',
        'soft-hover': '0 10px 30px -4px rgba(34, 195, 244, 0.12), 0 4px 12px -2px rgba(20, 24, 31, 0.04)',
        'pill': '0 2px 10px rgba(34, 195, 244, 0.28)',
      },
    },
  },
  plugins: [],
}
