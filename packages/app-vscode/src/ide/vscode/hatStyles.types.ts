// The hat color/shape vocabulary was promoted to @cursorless/lib-common so
// non-VS-Code consumers (e.g. @cursorless/command-visualizer) can import it
// without a clone. This file is a backward-compatible re-export shim so the
// existing app-vscode consumers keep importing from their original path.

export type {
  HatColor,
  HatShape,
  HatNonDefaultShape,
  VscodeHatStyleName,
} from "@cursorless/lib-common";
export {
  HAT_COLORS,
  HAT_NON_DEFAULT_SHAPES,
  HAT_SHAPES,
} from "@cursorless/lib-common";
