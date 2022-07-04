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
    // The selection from the beginning was this pair and we should not go into the interior but instead look in the parent.
    const isNotInterior =
      target.contentRange.isEqual(pairInfo.contentRange) ||
      target.contentRange.start.isBeforeOrEqual(pairInfo.boundary[0].start) ||
      target.contentRange.end.isAfterOrEqual(pairInfo.boundary[1].end);

    if (!isNotInterior) {
      const stringPairInfo = getStringSurroundingPair(
        context,
        target.editor,
        pairInfo.contentRange
      );

      // We don't look for items inside strings.
      if (
        stringPairInfo == null ||
        stringPairInfo.contentRange.start.isBefore(pairInfo.contentRange.start)
      ) {
        return {
          range: pairInfo.interiorRange,
          boundary: pairInfo.boundary,
        };
      }
    }
    pairInfo = getParentSurroundingPair(context, target.editor, pairInfo);
  }

  // We have not found a pair containing the delimiter. Look at the full line.
  return {
    range: fitRangeToLineContent(target.editor, target.contentRange),
  };
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
    { type: "surroundingPair", delimiter: "any" },
    ["parentheses", "squareBrackets", "curlyBrackets", "angleBrackets"]
  );
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

function getStringSurroundingPair(
  context: ProcessedTargetsContext,
  editor: TextEditor,
  contentRange: Range
) {
  return processSurroundingPair(context, editor, contentRange, {
    type: "surroundingPair",
    delimiter: "string",
  });
}
