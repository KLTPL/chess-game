/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./src/**/*.{html,js,astro,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        primary: "#016779",
        "primary-b": "#028197",
        "primary-d": "#015665",
        "primary-alt": "#008573",
        secondary: "#ff4400e6",
        bg1: "#212326",
        text1: "#ffffff",
      },
    },
  },
  plugins: [],
};

// background-color: hsl(216, 7%, 14%);
// color: hsl(0, 0%, 0%);
