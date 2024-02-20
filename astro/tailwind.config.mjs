/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./src/**/*.{html,js,astro,ts,tsx}"],
  theme: {
    fontSize: {
      sm: "0.8rem",
      base: "1rem",
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        primary: "#016779",
        "primary-b": "#028197",
        "primary-d": "#015665",
        "primary-alt": "#008573",
        secondary: "#229a49",
        "secondary-d": "#1b7b3a",
        bg1: "#212326",
        bg2: "#303236",
        bg3: "#9fa3aa",
        text1: "#ffffff",
      },
    },
  },
  plugins: [],
};

// background-color: hsl(216, 7%, 14%);
// color: hsl(0, 0%, 0%);
