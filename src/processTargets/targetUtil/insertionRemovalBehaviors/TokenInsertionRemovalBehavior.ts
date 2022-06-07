import { Range } from "vscode";
import { Target } from "../../../typings/target.types";
import { isAtEndOfLine, isAtStartOfLine } from "../../../util/rangeUtils";
import PlainTarget from "../../targets/PlainTarget";
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
  const { start, end } = contentRange ?? target.contentRange;

  const leadingDelimiterTarget = getTokenLeadingDelimiterTarget(target);
  const trailingDelimiterTarget = getTokenTrailingDelimiterTarget(target);

  // If there is a token directly to the left or right of us with no
  // separating white space, then we might join two tokens if we try to clean
  // up whitespace space. In this case we just remove the content range
  // without attempting to clean up white space.
  //
  // In the future, we might get more sophisticated and to clean up white space if we can detect that it won't cause two tokens be merged
  if (
    (leadingDelimiterTarget == null && !isAtStartOfLine(start)) ||
    (trailingDelimiterTarget == null && !isAtEndOfLine(target.editor, end))
  ) {
    return contentRange ?? target.contentRange;
  }

  // Otherwise, behave like a whitespace delimited sequence
  return getDelimitedSequenceRemovalRange(target, contentRange);
}
