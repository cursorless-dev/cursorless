// Hat shape adjustments were promoted to @cursorless/lib-common so non-VS-Code
// consumers (e.g. @cursorless/command-visualizer) can import them without a
// clone. This file is a backward-compatible re-export shim so the existing
// app-vscode consumers (VscodeHatRenderer, performPr1868ShapeUpdateInit, the
// hatAdjustments scripts) keep importing from their original path unchanged.

export type {
  HatAdjustments,
  IndividualHatAdjustmentMap,
} from "@cursorless/lib-common";
export {
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
  defaultShapeAdjustments,
} from "@cursorless/lib-common";
