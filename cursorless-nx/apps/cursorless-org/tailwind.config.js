// apps/app1/tailwind.config.js
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Inconsolata'],
      },
      colors: {
        salmon: {
          100: '#FFFAF8',
          300: '#F8C9BA',
          400: '#FF9273',
          800: '#161110',
          900: '#0A0707',
        },
      },
    },
  },
  plugins: [],
};
