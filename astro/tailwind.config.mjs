/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./src/**/*.{html,js,astro,ts,tsx}"],
  theme: {
    // fontSize: {
    //   sm: "0.8rem",
    //   base: "1rem",
    //   xl: "1.25rem",
    //   "2xl": "1.563rem",
    //   "3xl": "1.953rem",
    //   "4xl": "2.441rem",
    //   "5xl": "3.052rem",
    // },
    fontSize: {
      sm: "clamp(0.8rem, 0.17vi + 0.76rem, 0.89rem)",
      base: "clamp(1rem, 0.34vi + 0.91rem, 1.19rem)",
      lg: "clamp(1.25rem, 0.61vi + 1.1rem, 1.58rem)",
      xl: "clamp(1.56rem, 1vi + 1.31rem, 2.11rem)",
      "2xl": "clamp(1.95rem, 1.56vi + 1.56rem, 2.81rem)",
      "3xl": "clamp(2.44rem, 2.38vi + 1.85rem, 3.75rem)",
      "4xl": "clamp(3.05rem, 3.54vi + 2.17rem, 5rem)",
      "5xl": "clamp(3.81rem, 5.18vi + 2.52rem, 6.66rem)",
      "6xl": "clamp(4.77rem, 7.48vi + 2.9rem, 8.88rem)",
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
        "secondary-b": "#25af52",
        bg1: "#212326",
        bg2: "#303236",
        bg3: "#202224",
        bg4: "#9fa3aa",
        text1: "#ffffff",
      },
    },
  },
  plugins: [],
};

// background-color: hsl(216, 7%, 14%);
// color: hsl(0, 0%, 0%);
