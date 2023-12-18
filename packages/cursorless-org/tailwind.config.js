import { fontFamily as _fontFamily } from "tailwindcss/defaultTheme";
import { join } from "path";
import { readFileSync } from "fs";

const CONTENT_RATIO = 1000 / 814;

/**
 * Returns css strings for width, height, and fontSize that will result in a
 * fixed aspect ratio and automaticaly expand to fill the smallest dimension.
 *
 * Based loosely on https://stackoverflow.com/a/20593342
 * @type {(marginXPct: number, marginYPct: number) => {width: string, height:
 * string, fontSize: string}}
 */
function getScalingStrings(marginXPct, marginYPct) {
  const widthVw = 100 - marginXPct * 2;
  const maxWidth = `calc(${widthVw}vw - var(--safe-area-inset-right) - var(--safe-area-inset-left))`;
  const heightVh = 100 - marginYPct * 2;
  const maxHeight = `calc(${heightVh}vh - var(--safe-area-inset-bottom) - var(--safe-area-inset-top))`;
  const heightFromWidth = `calc(${maxWidth} / ${CONTENT_RATIO})`;
  const widthFromHeight = `calc(${maxHeight} * ${CONTENT_RATIO})`;

  return {
    width: `min(${maxWidth}, ${widthFromHeight})`,
    height: `min(${maxHeight}, ${heightFromWidth})`,
    fontSize: `min(calc(${maxWidth} / 100), calc(${widthFromHeight} / 100))`,
  };
}

const {
  width: smallWidth,
  height: smallHeight,
  fontSize: smallFontSize,
} = getScalingStrings(15.28, 10.255);

/**
 * On screens that have very wide or very tall aspect ratios, we expand closer
 * to the narrow dimension, otherwise the content feels small.
 */
const {
  width: stretchedWidth,
  height: stretchedHeight,
  fontSize: stretchedFontSize,
} = getScalingStrings(5, 5);

const references = JSON.parse(
  readFileSync(join(__dirname, "tsconfig.json"), "utf-8"),
).references.map((ref) => ref.path);

/** @type {import('tailwindcss').Config} */
export const content = [".", ...references].map(
  (pkg) => `${pkg}/src/**/*.{js,ts,jsx,tsx}`,
);
export const theme = {
  extend: {
    screens: {
      stretched: { raw: "(min-aspect-ratio: 2/1), (max-aspect-ratio: 1/1)" },
    },
    fontFamily: {
      mono: ["Inconsolata", ..._fontFamily.mono],
      monoWide: ["Inconsolata-SemiExpanded", ..._fontFamily.mono],
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
      smBase: smallFontSize,
      stretchedBase: stretchedFontSize,
      xs: "1.2em",
      lg: "1.8em",
      "2xl": "2.4em",
      "3xl": "3.6em",
    },
    colors: {
      salmon: {
        100: "#FFFAF8",
        300: "#F8C9BA",
        400: "#FF9273",
        700: "#372e2a",
        800: "#161110",
        900: "#0A0707",
      },
      teal: {
        100: "#F9FFFE",
        200: "#CDFFF9",
        300: "#99FFF3",
        400: "#00907F",
        500: "#47D4C3",
        600: "#0F776B",
        700: "#005349",
        800: "#00443C",
        900: "#00110F",
      },
    },
  },
};
export const plugins = [];
