import type { Node } from "web-tree-sitter";
import type { MutableQueryCapture } from "./QueryCapture";

export function getNode(capture: MutableQueryCapture): Node {
  if (capture.node == null) {
    throw Error(
      `Capture ${capture.name} has no node. The range of the capture has already been updated and no longer matches a specific node.`,
    );
  }
  return capture.node;
}
