// apps/app1/tailwind.config.js
const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');

const CONTENT_RATIO = 1000 / 814;

/** @type {(marginXPct: number, marginYPct: number) => [string, string, string]} */
function getScalingStrings(marginXPct, marginYPct) {
  const widthVw = 100 - marginXPct;
  const heightVh = 100 - marginYPct;
  const widthVh = heightVh * CONTENT_RATIO;
  const heightVw = widthVw / CONTENT_RATIO;

  const classInfos = [
    [widthVw, widthVh],
    [heightVw, heightVh],
    [widthVw / 100, widthVh / 100],
  ];

  return classInfos.map(
    ([valueVw, valueVh]) =>
      `min(${valueVw.toFixed(6)}vw, ${valueVh.toFixed(6)}vh)`
  );
}

const [smallWidth, smallHeight, smallText] = getScalingStrings(10, 10);
const [mediumWidth, mediumHeight, mediumText] = getScalingStrings(10, 10);
const [largeWidth, largeHeight, largeText] = getScalingStrings(10, 10);
const [extraLargeWidth, extraLargeHeight, extraLargeText] = getScalingStrings(
  30.56,
  20.51
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
      fontFamily: {
        mono: ['Inconsolata-SemiExpanded'],
      },
      width: {
        smBase: smallWidth,
        mdBase: mediumWidth,
        lgBase: largeWidth,
        xlBase: extraLargeWidth,
      },
      height: {
        smBase: smallHeight,
        mdBase: mediumHeight,
        lgBase: largeHeight,
        xlBase: extraLargeHeight,
      },
      fontSize: {
        smBase: smallText,
        mdBase: mediumText,
        lgBase: largeText,
        xlBase: extraLargeText,
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
