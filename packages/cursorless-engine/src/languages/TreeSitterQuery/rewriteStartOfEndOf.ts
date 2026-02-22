import type { Range } from "@cursorless/common";
import type { QueryCapture } from "./QueryCapture";

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
  if (captureName.endsWith(".startOf")) {
    return range.start.toEmptyRange();
  }
  if (captureName.endsWith(".endOf")) {
    return range.end.toEmptyRange();
  }
  return range;
}

function getStartOfEndOfName(capture: QueryCapture): string {
  if (capture.name.endsWith(".startOf")) {
    return capture.name.slice(0, -8);
  }
  if (capture.name.endsWith(".endOf")) {
    return capture.name.slice(0, -6);
  }
  return capture.name;
}
