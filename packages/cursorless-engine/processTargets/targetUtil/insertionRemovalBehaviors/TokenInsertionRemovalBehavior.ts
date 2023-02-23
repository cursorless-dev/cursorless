import { Range, TextDocument, TextEditor } from "@cursorless/common";
import { tokenize } from "../../../tokenizer";
import type { Target } from "../../../typings/target.types";
import { expandToFullLine } from "../../../util/rangeUtils";
import { PlainTarget } from "../../targets";

export function getTokenLeadingDelimiterTarget(
  target: Target,
): Target | undefined {
  const { editor } = target;
  const { start } = target.contentRange;

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
 * Constructs a removal range for the given target that will clean up a json
 * whitespace on one side unless it will cause two tokens to be merged. This
 * removal range is designed to be used with things that should clean themselves
 * up as if they're a range of tokens.
 * @param target The target to get the token removal range for
 * @returns The removal range for the given target
 */
export function getTokenRemovalRange(target: Target): Range {
  const { editor, contentRange } = target;
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

  if (!trailingWhitespaceRange.isEmpty) {
    const candidateRemovalRange = contentRange.union(trailingWhitespaceRange);

    if (!mergesTokens(editor, contentRange, candidateRemovalRange)) {
      // If there is trailing whitespace and it doesn't result in tokens getting
      // merged, then we remove it
      return candidateRemovalRange;
    }
  }

  if (
    !leadingWhitespaceRange.isEmpty &&
    leadingWhitespaceRange.start.character !== 0
  ) {
    const candidateRemovalRange = leadingWhitespaceRange.union(contentRange);

    if (!mergesTokens(editor, contentRange, candidateRemovalRange)) {
      // If there is leading whitespace that is not indentation and it doesn't
      // result in tokens getting merged, then we remove it
      return candidateRemovalRange;
    }
  }

  // Otherwise just return the content range
  return contentRange;
}

/** Returns true if removal range causes tokens to merge */
function mergesTokens(
  editor: TextEditor,
  contentRange: Range,
  removalRange: Range,
) {
  const { document } = editor;
  const fullRange = expandToFullLine(editor, contentRange);
  const fullText = document.getText(fullRange);
  const fullTextOffset = document.offsetAt(fullRange.start);

  const numTokensContentRangeRemoved = calculateNumberOfTokensAfterRemoval(
    document,
    fullText,
    fullTextOffset,
    contentRange,
  );

  const numTokensRemovalRangeRemoved = calculateNumberOfTokensAfterRemoval(
    document,
    fullText,
    fullTextOffset,
    removalRange,
  );

  return numTokensContentRangeRemoved !== numTokensRemovalRangeRemoved;
}

function calculateNumberOfTokensAfterRemoval(
  document: TextDocument,
  fullText: string,
  fullTextOffset: number,
  removalRange: Range,
): number {
  const startIndex = document.offsetAt(removalRange.start) - fullTextOffset;
  const endIndex = document.offsetAt(removalRange.end) - fullTextOffset;
  const modifiedText = fullText.slice(0, startIndex) + fullText.slice(endIndex);
  const tokens = tokenize(modifiedText, document.languageId, (m) => m);
  return tokens.length;
}
