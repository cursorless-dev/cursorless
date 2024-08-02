import type { ScopeVisualizerColorConfig } from "@cursorless/vscode-common";

/**
 * Fake color config to use for testing. We use an alpha of 50% and try to use
 * different rgb channels where possible to make it easier to see what happens
 * when we blend colors.
 */
export const COLOR_CONFIG: ScopeVisualizerColorConfig = {
  dark: {
    content: {
      background: "#00000180",
      borderPorous: "#00000280",
      borderSolid: "#00000380",
    },
    domain: {
      background: "#01000080",
      borderPorous: "#02000080",
      borderSolid: "#03000080",
    },
    iteration: {
      background: "#00000480",
      borderPorous: "#00000580",
      borderSolid: "#00000680",
    },
    removal: {
      background: "#00010080",
      borderPorous: "#00020080",
      borderSolid: "#00030080",
    },
  },
  light: {
    content: {
      background: "#00000180",
      borderPorous: "#00000280",
      borderSolid: "#00000380",
    },
    domain: {
      background: "#01000080",
      borderPorous: "#02000080",
      borderSolid: "#03000080",
    },
    iteration: {
      background: "#00000480",
      borderPorous: "#00000580",
      borderSolid: "#00000680",
    },
    removal: {
      background: "#00010080",
      borderPorous: "#00020080",
      borderSolid: "#00030080",
    },
  },
};
