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
  return captures.map((capture) => {
    // Remove trailing .startOf and .endOf, adjusting ranges.
    if (capture.name.endsWith(".startOf")) {
      return {
        ...capture,
        name: capture.name.replace(/\.startOf$/, ""),
        range: capture.range.start.toEmptyRange(),
      };
    }
    if (capture.name.endsWith(".endOf")) {
      return {
        ...capture,
        name: capture.name.replace(/\.endOf$/, ""),
        range: capture.range.end.toEmptyRange(),
      };
    }
    return capture;
  });
}
