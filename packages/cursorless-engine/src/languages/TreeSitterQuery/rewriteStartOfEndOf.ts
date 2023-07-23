import { MutableQueryCapture } from "./QueryCapture";

/**
 * Rewrite captures, absorbing .startOf and .endOf into ranges.
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
