import { Range, TextEditor } from "@cursorless/common";
import { last } from "lodash";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";

/**
 * Get the range to iterate over for the given editor.  We take the union of all
 * visible ranges, add 10 lines either side to make scrolling a bit smoother,
 * and then expand to the largest ancestor of the start and end of the visible
 * range, so that we properly show nesting.
 * @param editor The editor to get the iteration range for
 * @param scopeHandler The scope handler to use
 * @returns The range to iterate over
 */
export function getIterationRange(
  editor: TextEditor,
  scopeHandler: ScopeHandler,
): Range {
  let visibleRange = editor.visibleRanges.reduce((acc, range) =>
    acc.union(range),
  );

  visibleRange = editor.document.range.intersection(
    visibleRange.with(
      visibleRange.start.translate(-10),
      visibleRange.end.translate(10),
    ),
  )!;

  // Expand to largest ancestor of start of visible range FIXME: It's
  // possible that the removal range will be bigger than the domain range,
  // in which case we'll miss a scope if its removal range is visible but
  // its domain range is not.  I don't think we care that much; they can
  // scroll, and we have the extra 10 lines on either side which might help.
  const expandedStart =
    last(
      Array.from(
        scopeHandler.generateScopes(editor, visibleRange.start, "forward", {
          containment: "required",
        }),
      ),
    )?.domain ?? visibleRange;

  // Expand to largest ancestor of end of visible range
  const expandedEnd =
    last(
      Array.from(
        scopeHandler.generateScopes(editor, visibleRange.end, "forward", {
          containment: "required",
        }),
      ),
    )?.domain ?? visibleRange;

  return expandedStart.union(expandedEnd);
}
