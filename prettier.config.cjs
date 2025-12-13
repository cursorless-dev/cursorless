/* global module, require */

/** @type {import("prettier").Config} */
module.exports = {
  trailingComma: "all",

  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
