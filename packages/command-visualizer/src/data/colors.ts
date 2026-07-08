// COLOR_MATRIX / EDITOR_CHROME are the only command-visualizer-local color data.
// The theme hexes have no importable TS home: they're declared in
// app-vscode/package.json as VS Code setting defaults (\`cursorless.colors.dark\`/
// \`.light\`) and read at runtime from VS Code config — there's no compile-time
// constant to import, so a headless renderer mirrors the defaults here (verified
// against app-vscode/package.json).
//
// The hat color VOCABULARY (\`HatColor\`, \`HAT_COLORS\`) is NOT re-exported here —
// consumers import it directly from @cursorless/lib-common.

import type { HatColor } from "@cursorless/lib-common";

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
