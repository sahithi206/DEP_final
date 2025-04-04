/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      //colors used in this
      colors: {
        primary : "#2885FF",
        secondary: "#EF863E",

      },
    },
  },
  plugins: [],
}

