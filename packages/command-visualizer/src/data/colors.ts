// Color matrix — hexes VERBATIM from
// cursorless/packages/app-vscode/package.json cursorless.colors.{dark,light}
// (verified 2026-06-08; also mirrored in screenshots/oracle/color-matrix.json).
// SPEC §4.4.

export type HatColor =
  | "default"
  | "blue"
  | "green"
  | "red"
  | "pink"
  | "yellow"
  | "userColor1"
  | "userColor2"
  | "userColor3"
  | "userColor4";

export const HAT_COLORS: HatColor[] = [
  "default",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
  "userColor1",
  "userColor2",
  "userColor3",
  "userColor4",
];

export type Theme = "dark" | "light";

export const COLOR_MATRIX: Record<Theme, Record<HatColor, string>> = {
  dark: {
    default: "#B9B6CD",
    blue: "#089ad3",
    green: "#36B33F",
    red: "#E02D28",
    pink: "#E06CAA",
    yellow: "#E5C02C",
    userColor1: "#6a00ff",
    userColor2: "#ffd8b1",
    userColor3: "#6b8e23",
    userColor4: "#e0e0e0",
  },
  light: {
    default: "#757180",
    blue: "#089ad3",
    green: "#36B33F",
    red: "#E02D28",
    pink: "#e0679f",
    yellow: "#edb62b",
    userColor1: "#6a00ff",
    userColor2: "#ffd8b1",
    userColor3: "#6b8e23",
    userColor4: "#e0e0e0",
  },
};

// Editor chrome colors (VS Code dark+ / light+ defaults).
export const EDITOR_CHROME: Record<
  Theme,
  { bg: string; fg: string; sel: string; caret: string }
> = {
  dark: { bg: "#1e1e1e", fg: "#d4d4d4", sel: "#264f78", caret: "#aeafad" },
  light: { bg: "#ffffff", fg: "#1f1f1f", sel: "#add6ff", caret: "#000000" },
};
