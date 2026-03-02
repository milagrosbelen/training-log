/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          50: "#e8ffe8",
          100: "#b8ffc4",
          300: "#3dff5c",
          400: "#2AF447",
          500: "#2AF447",
          600: "#22cc39",
        },
      },
    },
  },
  plugins: [],
}
