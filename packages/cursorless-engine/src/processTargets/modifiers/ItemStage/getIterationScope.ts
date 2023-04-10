import { Range, TextEditor } from "@cursorless/common";
import { Target } from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { fitRangeToLineContent } from "../scopeHandlers";
import { processSurroundingPair } from "../surroundingPair";
import { SurroundingPairInfo } from "../surroundingPair/extractSelectionFromSurroundingPairOffsets";

/**
 * Get the iteration scope range for item scope.
 * Try to find non-string surrounding scope with a fallback to line content.
 * @param context The stage process context
 * @param target The stage target
 * @returns The stage iteration scope and optional surrounding pair boundaries
 */
export function getIterationScope(
  context: ProcessedTargetsContext,
  target: Target,
): { range: Range; boundary?: [Range, Range] } {
  let pairInfo = getSurroundingPair(context, target.editor, target.contentRange);

  // Iteration is necessary in case of nested strings
  while (pairInfo != null) {
    const stringPairInfo = getStringSurroundingPair(
      context,
      target.editor,
      pairInfo.contentRange,
    );

    // We don't look for items inside strings.
    if (
      // Not in a string
      stringPairInfo == null ||
      // In a non-string surrounding pair that is inside a surrounding string. This is fine.
      stringPairInfo.contentRange.start.isBefore(pairInfo.contentRange.start)
    ) {
      return {
        range: pairInfo.interiorRange,
        boundary: pairInfo.boundary,
      };
    }

    pairInfo = getParentSurroundingPair(context, target.editor, pairInfo);
  }

  // We have not found a surrounding pair. Use the line.
  return {
    range: fitRangeToLineContent(target.editor, target.contentRange),
  };
}

function getParentSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  pairInfo: SurroundingPairInfo,
) {
  const startOffset = editor.document.offsetAt(pairInfo.contentRange.start);
  // Can't have a parent; already at start of document
  if (startOffset === 0) {
    return null;
  }
  // Step out of this pair and see if we have a parent
  const position = editor.document.positionAt(startOffset - 1);
  return getSurroundingPair(context, editor, new Range(position, position));
}

function getSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range,
) {
  return processSurroundingPair(context, editor, contentRange, {
    type: "surroundingPair",
    delimiter: "collectionBoundary",
    requireStrongContainment: true,
  });
}

function getStringSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range,
) {
  return processSurroundingPair(context, editor, contentRange, {
    type: "surroundingPair",
    delimiter: "string",
    requireStrongContainment: true,
  });
}
