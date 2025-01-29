import type { Range, TextDocument } from "@cursorless/common";
import type { Target } from "../../../../typings/target.types";
import { union } from "../../../../util/rangeUtils";
import { LineTarget } from "../../LineTarget";
import { ParagraphTarget } from "../../ParagraphTarget";
import { TokenTarget } from "../../TokenTarget";

/**
 * For targets that don't provide a removal range, we can effectively duck-type one if its content
 * range matches that of a token, series of whole lines, or paragraph. If so, we can use the removal range
 * for a target of that type.
 */
export function getSmartRemovalTarget(target: Target): Target {
  const { editor, isReversed } = target;
  const { document } = editor;
  const contentRange = union(target.contentRange, target.prefixRange);

  if (!isLine(document, contentRange)) {
    return new TokenTarget({
      editor,
      isReversed,
      contentRange: contentRange,
    });
  }

  if (isParagraph(document, contentRange)) {
    return new ParagraphTarget({
      editor,
      isReversed,
      contentRange: contentRange,
    });
  }

  return new LineTarget({
    editor,
    isReversed,
    contentRange: contentRange,
  });
}

/**
 * Returns whether the given content range is a series of line(s) that do not have preceding
 * or trailing content (whitespace is OK).
 */
function isLine(document: TextDocument, contentRange: Range): boolean {
  const start = document.lineAt(contentRange.start).rangeTrimmed?.start;
  const end = document.lineAt(contentRange.end).rangeTrimmed?.end;
  return (
    start != null &&
    end != null &&
    start.isEqual(contentRange.start) &&
    end.isEqual(contentRange.end)
  );
}

/**
 * Returns whether the given content range is a paragraph (a series of whole lines bounded by whitespace or empty lines on each side).
 */
function isParagraph(document: TextDocument, contentRange: Range): boolean {
  const { start, end } = contentRange;
  return (
    (start.line === 0 || document.lineAt(start.line - 1).isEmptyOrWhitespace) &&
    (end.line === document.lineCount - 1 ||
      document.lineAt(end.line + 1).isEmptyOrWhitespace)
  );
}
