import { fontFamily as _fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
// packages/test-case-component/src/components/ add dir
// just add this damn dir to the content array, this FILE is at packages/cursorless-org-docs/tailwind.config.js
export const content = [
  "./src/**/*.{js,ts,jsx,tsx}",
  "../test-case-component/src/components/**/*.{js,ts,jsx,tsx}",
];

export const corePlugins = {
  preflight: false,
};
export const plugins = [];
