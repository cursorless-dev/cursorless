import { range as lodashRange } from "lodash-es";
import { Range } from "../types/Range";
import { TextEditor } from "../types/TextEditor";

/**
 * @param editor The editor containing the range
 * @param range The range to get the line ranges for
 * @returns A list of ranges, one for each line in the given range, with the
 * first and last ranges trimmed to the start and end of the given range.
 */
export function getLineRanges(editor: TextEditor, range: Range): Range[] {
  const { document } = editor;
  const lineRanges = lodashRange(range.start.line, range.end.line + 1).map(
    (lineNumber) => document.lineAt(lineNumber).range,
  );
  lineRanges[0] = lineRanges[0].with(range.start);
  lineRanges[lineRanges.length - 1] = lineRanges[lineRanges.length - 1].with(
    undefined,
    range.end,
  );
  return lineRanges;
}
