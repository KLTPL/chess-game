/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  trailingComma: "es5",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
