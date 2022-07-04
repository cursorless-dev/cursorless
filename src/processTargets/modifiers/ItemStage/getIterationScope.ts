import { Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { fitRangeToLineContent } from "../scopeTypeStages/LineStage";
import {
  processSurroundingPair,
  processSurroundingPairForDelimiters,
} from "../surroundingPair";
import { SurroundingPairInfo } from "../surroundingPair/extractSelectionFromSurroundingPairOffsets";

export function getIterationScope(
  context: ProcessedTargetsContext,
  target: Target
) {
  let pairInfo = getSurroundingPair(
    context,
    target.editor,
    target.contentRange
  );

  while (pairInfo != null) {
    const stringPairInfo = getStringSurroundingPair(
      context,
      target.editor,
      pairInfo.contentRange
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
  pairInfo: SurroundingPairInfo
) {
  // Step out of this pair and see if we have a parent
  const position = editor.document.positionAt(
    editor.document.offsetAt(pairInfo.contentRange.start) - 1
  );
  if (position.isEqual(pairInfo.contentRange.start)) {
    return null;
  }
  return getSurroundingPair(context, editor, new Range(position, position));
}

function getSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range
) {
  return processSurroundingPairForDelimiters(
    context,
    editor,
    contentRange,
    {
      type: "surroundingPair",
      delimiter: "any",
      requireStrongContainment: true,
    },
    ["parentheses", "squareBrackets", "curlyBrackets", "angleBrackets"]
  );
}

function getStringSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range
) {
  return processSurroundingPair(context, editor, contentRange, {
    type: "surroundingPair",
    delimiter: "string",
    requireStrongContainment: true,
  });
}
