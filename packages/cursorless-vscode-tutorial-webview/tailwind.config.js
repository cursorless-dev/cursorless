import { readFileSync } from "node:fs";

const references = JSON.parse(
  readFileSync("tsconfig.json", "utf-8"),
).references.map((ref) => ref.path);

/** @type {import('tailwindcss').Config} */
export default {
  content: [".", ...references].flatMap((pkg) => [
    `${pkg}/src/**/*.{ts,tsx,html}`,
    `!${pkg}/src/**/*.{stories,spec}.{ts,tsx,html}`,
  ]),
  theme: {
    extend: {},
  },
  plugins: [],
};
