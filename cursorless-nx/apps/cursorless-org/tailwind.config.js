// apps/app1/tailwind.config.js
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const defaultTheme = require('tailwindcss/defaultTheme');
const { join } = require('path');

const CONTENT_RATIO = 1000 / 814;

/**
 * Returns css strings [width, height, fontSize] that will result in a fixed
 * aspect ratio and automaticaly expand to fill the smallest dimension.
 *
 * Based loosely on https://stackoverflow.com/a/20593342
 * @type {(marginXPct: number, marginYPct: number) => [string, string, string]}
 */
function getScalingStrings(marginXPct, marginYPct) {
  const widthVw = 100 - marginXPct;
  const maxWidth = `calc(${widthVw}vw - var(--safe-area-inset-right) - var(--safe-area-inset-left))`;
  const heightVh = 100 - marginYPct;
  const maxHeight = `calc(${heightVh}vh - var(--safe-area-inset-bottom) - var(--safe-area-inset-top))`;
  const heightFromWidth = `calc(${maxWidth} / ${CONTENT_RATIO})`;
  const widthFromHeight = `calc(${maxHeight} * ${CONTENT_RATIO})`;

  const classInfos = [
    [maxWidth, widthFromHeight],
    [maxHeight, heightFromWidth],
    [`calc(${maxWidth} / 100)`, `calc(${widthFromHeight} / 100)`],
  ];

  return classInfos.map(([value1, value2]) => `min(${value1}, ${value2})`);
}

const [smallWidth, smallHeight, smallText] = getScalingStrings(30.56, 20.51);

/**
 * On screens that have very wide or very tall aspect ratios, we expand closer
 * to the narrow dimension, otherwise the content feels small.
 */
const [stretchedWidth, stretchedHeight, stretchedText] = getScalingStrings(
  10,
  10
);

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
      screens: {
        stretched: { raw: '(min-aspect-ratio: 2/1), (max-aspect-ratio: 1/1)' },
      },
      fontFamily: {
        mono: ['Inconsolata-SemiExpanded', ...defaultTheme.fontFamily.mono],
      },
      width: {
        smBase: smallWidth,
        stretchedBase: stretchedWidth,
      },
      height: {
        smBase: smallHeight,
        stretchedBase: stretchedHeight,
      },
      fontSize: {
        smBase: smallText,
        stretchedBase: stretchedText,
        xs: '1.2em',
        lg: '1.8em',
        '2xl': '2.4em',
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
