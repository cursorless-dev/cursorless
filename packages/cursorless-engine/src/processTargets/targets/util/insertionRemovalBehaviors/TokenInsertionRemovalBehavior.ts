import { Range, TextEditor } from "@cursorless/common";
import type { Target } from "../../../../typings/target.types";
import { expandToFullLine, union } from "../../../../util/rangeUtils";
import { PlainTarget } from "../../PlainTarget";

const leadingDelimiters = ['"', "'", "(", "[", "{", "<"];
const trailingDelimiters = ['"', "'", ")", "]", "}", ">", ",", ";", ":"];

export function getTokenLeadingDelimiterTarget(
  target: Target,
): Target | undefined {
  const { editor } = target;
  const { start } = union(target.contentRange, target.prefixRange);

  const startLine = editor.document.lineAt(start);
  const leadingText = startLine.text.slice(0, start.character);
  const leadingDelimiters = leadingText.match(/\s+$/);

  return leadingDelimiters == null
    ? undefined
    : new PlainTarget({
        contentRange: new Range(
          start.line,
          start.character - leadingDelimiters[0].length,
          start.line,
          start.character,
        ),
        editor,
        isReversed: target.isReversed,
      });
}

export function getTokenTrailingDelimiterTarget(
  target: Target,
): Target | undefined {
  const { editor } = target;
  const { end } = target.contentRange;

  const endLine = editor.document.lineAt(end);
  const trailingText = endLine.text.slice(end.character);
  const trailingDelimiters = trailingText.match(/^\s+/);

  return trailingDelimiters == null
    ? undefined
    : new PlainTarget({
        contentRange: new Range(
          end.line,
          end.character,
          end.line,
          end.character + trailingDelimiters[0].length,
        ),
        editor,
        isReversed: target.isReversed,
      });
}

/**
 * Constructs a removal range for the given target that may remove whitespace on
 * one side. This removal range is designed to be used with things that should
 * clean themselves up as if they're a range of tokens.
 *
 * We determine whether to include adjacent whitespace based on the following
 * rules:
 *
 * - If we would just be leaving a line with whitespace on it, we delete the
 *   whitespace
 * - Otherwise, if there is trailing whitespace, we include it if any of the
 *   following is true:
 *   - there is leading whitespace, OR
 *   - we are at start of line, OR
 *   - there is an approved leading delimiter character (eg `(`, `[`, etc).
 * - Otherwise, if there is leading whitespace, we include it if any of the
 *   following is true:
 *   - we are at end of line, OR
 *   - there is an approved trailing delimiter character (eg `)`, `]`, `:`, `;`,
 *     etc).
 * - Otherwise, we don't include any adjacent whitespace
 *
 * @param target The target to get the token removal range for
 * @returns The removal range for the given target
 */
export function getTokenRemovalRange(target: Target): Range {
  const { editor } = target;
  const contentRange = union(target.contentRange, target.prefixRange);
  const { start, end } = contentRange;

  const leadingWhitespaceRange =
    target.getLeadingDelimiterTarget()?.contentRange ?? start.toEmptyRange();

  const trailingWhitespaceRange =
    target.getTrailingDelimiterTarget()?.contentRange ?? end.toEmptyRange();

  const fullLineRange = expandToFullLine(editor, contentRange);

  if (
    leadingWhitespaceRange
      .union(trailingWhitespaceRange)
      .isRangeEqual(fullLineRange)
  ) {
    // If we would just be leaving a line with whitespace on it, we delete the
    // whitespace
    return fullLineRange;
  }

  // Use trailing range if: There is a leading range OR there is no leading
  // content OR there is an approved leading delimiter character
  if (!trailingWhitespaceRange.isEmpty) {
    if (
      !leadingWhitespaceRange.isEmpty ||
      contentRange.start.isEqual(fullLineRange.start) ||
      leadingDelimiters.includes(getLeadingCharacter(editor, contentRange))
    ) {
      return contentRange.union(trailingWhitespaceRange);
    }
  }

  // Use leading range if: There is no trailing content OR there is an approved
  // trailing delimiter character
  if (!leadingWhitespaceRange.isEmpty) {
    if (
      contentRange.end.isEqual(fullLineRange.end) ||
      trailingDelimiters.includes(getTrailingCharacter(editor, contentRange))
    ) {
      return contentRange.union(leadingWhitespaceRange);
    }
  }

  // Otherwise just return the content range
  return contentRange;
}

function getLeadingCharacter(editor: TextEditor, contentRange: Range): string {
  const { start } = contentRange;
  const line = editor.document.lineAt(start);
  return start.isAfter(line.range.start)
    ? editor.document.getText(new Range(start.translate(undefined, -1), start))
    : "";
}

function getTrailingCharacter(editor: TextEditor, contentRange: Range): string {
  const { end } = contentRange;
  const line = editor.document.lineAt(end);
  return end.isBefore(line.range.end)
    ? editor.document.getText(new Range(end.translate(undefined, 1), end))
    : "";
}
