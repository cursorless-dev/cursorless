import type { Range } from "@cursorless/common";
import type { Node } from "web-tree-sitter";
import type { QueryCapture } from "./QueryCapture";
import {
  getNodeEndRange,
  getNodeRange,
  getNodeStartRange,
} from "./getNodeRange";

const START_OF = ".startOf";
const END_OF = ".endOf";

/**
 * Modifies captures by applying any `.startOf` or `.endOf` suffixes. For
 * example, if we have a capture `@value.startOf`, we would rename it to
 * `@value` and adjust the range to be the start of the original range.
 *
 * @param captures A list of captures
 * @returns rewritten captures, with .startOf and .endOf removed
 */
export function rewriteStartOfEndOf(captures: QueryCapture[]): QueryCapture[] {
  return captures.map((capture) => ({
    ...capture,
    range: getStartOfEndOfRange(capture.name, capture.range),
    name: getStartOfEndOfName(capture),
  }));
}

export function getStartOfEndOfRange(captureName: string, range: Range): Range {
  if (captureName.endsWith(START_OF)) {
    return range.start.toEmptyRange();
  }
  if (captureName.endsWith(END_OF)) {
    return range.end.toEmptyRange();
  }
  return range;
}

export function getStartOfEndOfNodeRange(
  captureName: string,
  node: Node,
): Range {
  if (captureName.endsWith(START_OF)) {
    return getNodeStartRange(node);
  }
  if (captureName.endsWith(END_OF)) {
    return getNodeEndRange(node);
  }
  return getNodeRange(node);
}

function getStartOfEndOfName(capture: QueryCapture): string {
  if (capture.name.endsWith(START_OF)) {
    return capture.name.slice(0, -START_OF.length);
  }
  if (capture.name.endsWith(END_OF)) {
    return capture.name.slice(0, -END_OF.length);
  }
  return capture.name;
}

export function createTestQueryCapture(
  name: string,
  range: Range,
): QueryCapture {
  return {
    name,
    range,
    allowMultiple: false,
    insertionDelimiter: undefined,
    hasError: () => false,
  };
}
