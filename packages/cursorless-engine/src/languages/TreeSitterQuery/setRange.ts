import type { Range } from "@cursorless/common";
import type { MutableQueryCapture } from "./QueryCapture";

export function setRange(capture: MutableQueryCapture, range: Range) {
  capture.range = range;
  // Clear the node since the range has changed and the range no longer matches a specific node
  capture.node = undefined;
}
