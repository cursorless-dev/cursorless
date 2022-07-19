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
      fontSize: {
        xl: ['21px', '30px'],
        '4xl': ['44px', '56px'],
      },
      screens: {
        sm: '387px',
      },
    },
  },
  plugins: [],
};
