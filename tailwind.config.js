/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#080809",
          100: "#111111",
          200: "#141416",
          300: "#1B1B1B",
          400: "#2A2A2A",
        },
        ember: {
          DEFAULT: "#FF4F2A",
          50: "#fff1ee",
          100: "#f7d4cc",
          300: "#f28a76",
          400: "#FF6A4A",
          500: "#FF4F2A",
          600: "#E03F1E",
        },
        lime: {
          DEFAULT: "#C8F54A",
          400: "#C8F54A",
          500: "#C8F54A",
        },
        gold: {
          DEFAULT: "#C9A36A",
          400: "#D4B48A",
          500: "#C9A36A",
          600: "#B08C55",
        },
        neon: {
          50: "#fff1ee",
          100: "#f7d4cc",
          300: "#f28a76",
          400: "#EB573D",
          500: "#EB573D",
          600: "#D44A32",
        },
        slate: {
          50: "#f7f7f7",
          100: "#efefef",
          200: "#d7d7d7",
          300: "#cfcfcf",
          400: "#9a9a9a",
          500: "#8d8d8d",
          600: "#3a3a3a",
          700: "#1B1B1B",
          800: "#141414",
          900: "#0B0B0B",
          950: "#0B0B0B",
        },
      },
      fontFamily: {
        sans: ['"Inter Tight"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Inter Tight"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Inter Tight"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        ember: "0 0 20px rgba(255, 79, 42, 0.32)",
        "ember-sm": "0 0 10px rgba(255, 79, 42, 0.22)",
      },
    },
  },
  plugins: [],
}
