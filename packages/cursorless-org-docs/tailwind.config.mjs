import { readFileSync } from "node:fs";

const references = JSON.parse(
  readFileSync("tsconfig.json", "utf-8"),
).references.map((ref) => ref.path);

/** @type {import('tailwindcss').Config} */
export default {
  content: [".", ...references].map((pkg) => `${pkg}/src/**/*.{js,ts,jsx,tsx}`),
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
