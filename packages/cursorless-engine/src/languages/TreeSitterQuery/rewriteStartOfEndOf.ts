import type { Range } from "@cursorless/common";
import type { MutableQueryCapture } from "./QueryCapture";

/**
 * Modifies captures by applying any `.startOf` or `.endOf` suffixes. For
 * example, if we have a capture `@value.startOf`, we would rename it to
 * `@value` and adjust the range to be the start of the original range.
 *
 * @param captures A list of captures
 * @returns rewritten captures, with .startOf and .endOf removed
 */
export function rewriteStartOfEndOf(
  captures: MutableQueryCapture[],
): MutableQueryCapture[] {
  return captures.map((capture) => ({
    ...capture,
    range: getStartOfEndOfRange(capture),
    name: getStartOfEndOfName(capture),
  }));
}

export function getStartOfEndOfRange(capture: MutableQueryCapture): Range {
  if (capture.name.endsWith(".startOf")) {
    return capture.range.start.toEmptyRange();
  }
  if (capture.name.endsWith(".endOf")) {
    return capture.range.end.toEmptyRange();
  }
  return capture.range;
}

function getStartOfEndOfName(capture: MutableQueryCapture): string {
  if (capture.name.endsWith(".startOf")) {
    return capture.name.slice(0, -8);
  }
  if (capture.name.endsWith(".endOf")) {
    return capture.name.slice(0, -6);
  }
  return capture.name;
}
