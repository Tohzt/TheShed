/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { // Grayscale
          light: "#5d5b68",
          DEFAULT: "#4b4451",
          dark: "#232531",
        },
        tertiary: {
          light: "#ff4081",
          DEFAULT: "#f50057",
          dark: "#c51162",
        },
        secondary: {
          light: "#40c4ff",
          DEFAULT: "#00b0ff",
          dark: "#0091ea",
        },
      }
    },
  },
  plugins: [],
};
