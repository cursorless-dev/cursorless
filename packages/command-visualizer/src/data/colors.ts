// Hat color names/types are imported from @cursorless/lib-common (the shared
// hatStyles.types) — NOT redefined here. Only the theme hex MATRIX below is
// local, because it has no importable TS home: the hexes are declared in
// app-vscode's package.json as VS Code setting DEFAULTS
// (contributes.configuration "cursorless.colors.dark" / ".light") and read at
// runtime from VS Code configuration — there is no compile-time constant for
// them anywhere in the tree, so mirroring the defaults here (with provenance)
// is the faithful rendering for a headless renderer. Values verified against
// app-vscode/package.json 2026-06-08. SPEC §4.4.

export type { HatColor } from "@cursorless/lib-common";
export { HAT_COLORS } from "@cursorless/lib-common";

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
