import { Range, TextDocument, TextEditor } from "vscode";
import { tokenize } from "../../../core/tokenizer";
import type { Target } from "../../../typings/target.types";
import { expandToFullLine } from "../../../util/rangeUtils";
import { PlainTarget } from "../../targets";
import { getDelimitedSequenceRemovalRange } from "./DelimitedSequenceInsertionRemovalBehavior";

export function getTokenLeadingDelimiterTarget(
  target: Target
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
          start.character
        ),
        editor,
        isReversed: target.isReversed,
      });
}

export function getTokenTrailingDelimiterTarget(
  target: Target
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
          end.character + trailingDelimiters[0].length
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
 * @param contentRange Can be used to override the content range instead of
 * using the one on the target
 * @returns The removal range for the given target
 */
export function getTokenRemovalRange(
  target: Target,
  contentRange?: Range
): Range {
  const actualContentRange = contentRange ?? target.contentRange;
  const removalRange = getDelimitedSequenceRemovalRange(target, contentRange);

  if (!actualContentRange.isEqual(removalRange)) {
    if (
      !keepIndentation(target.editor, actualContentRange, removalRange) &&
      !mergesTokens(target.editor, actualContentRange, removalRange)
    ) {
      // We have no indentation we want to keep and we don't merge any tokens.
      return removalRange;
    }
  }

  // No removal range available or it would merge tokens.
  return actualContentRange;
}

/** Returns true if we want to keep indentation. ie don't use removal range */
function keepIndentation(
  editor: TextEditor,
  contentRange: Range,
  removalRange: Range
): boolean {
  const removesIndentation =
    !contentRange.start.isEqual(removalRange.start) &&
    removalRange.start.character === 0;
  if (removesIndentation) {
    const lineRange = editor.document.lineAt(removalRange.start).range;
    // Return true if there is more content on the line
    return !removalRange.contains(lineRange.end);
  }
  return false;
}

/** Returns true if removal range causes tokens to merge */
function mergesTokens(
  editor: TextEditor,
  contentRange: Range,
  removalRange: Range
) {
  const { document } = editor;
  const fullRange = expandToFullLine(editor, contentRange);
  const fullText = document.getText(fullRange);
  const fullTextOffset = document.offsetAt(fullRange.start);

  const numTokensContentRangeRemoved = calculateNumberOfTokensAfterRemoval(
    document,
    fullText,
    fullTextOffset,
    contentRange
  );

  const numTokensRemovalRangeRemoved = calculateNumberOfTokensAfterRemoval(
    document,
    fullText,
    fullTextOffset,
    removalRange
  );

  return numTokensContentRangeRemoved !== numTokensRemovalRangeRemoved;
}

function calculateNumberOfTokensAfterRemoval(
  document: TextDocument,
  fullText: string,
  fullTextOffset: number,
  removalRange: Range
): number {
  const startIndex = document.offsetAt(removalRange.start) - fullTextOffset;
  const endIndex = document.offsetAt(removalRange.end) - fullTextOffset;
  const modifiedText = fullText.slice(0, startIndex) + fullText.slice(endIndex);
  const tokens = tokenize(modifiedText, document.languageId, (m) => m);
  return tokens.length;
}
