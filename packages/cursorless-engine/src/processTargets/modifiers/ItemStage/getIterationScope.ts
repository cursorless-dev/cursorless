import { Range, TextEditor } from "@cursorless/common";
import { LanguageDefinition } from "../../../languages/LanguageDefinition";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { Target } from "../../../typings/target.types";
import { PlainTarget, SurroundingPairTarget } from "../../targets";
import { fitRangeToLineContent } from "../scopeHandlers";
import { processSurroundingPair } from "../surroundingPair";

/**
 * Get the iteration scope range for item scope.
 * Try to find non-string surrounding scope with a fallback to line content.
 * @param context The stage process context
 * @param target The stage target
 * @returns The stage iteration scope and optional surrounding pair boundaries
 */
export function getIterationScope(
  languageDefinition: LanguageDefinition | undefined,
  context: ProcessedTargetsContext,
  target: Target,
): { range: Range; boundary?: [Range, Range] } {
  let pairInfo = getSurroundingPair(languageDefinition, context, target);

  // Iteration is necessary in case of nested strings
  while (pairInfo != null) {
    const stringPairInfo = getStringSurroundingPair(
      languageDefinition,
      context,
      pairInfo,
    );

    // We don't look for items inside strings.
    if (
      // Not in a string
      stringPairInfo == null ||
      // In a non-string surrounding pair that is inside a surrounding string. This is fine.
      stringPairInfo.contentRange.start.isBefore(pairInfo.contentRange.start)
    ) {
      return {
        range: pairInfo.getInteriorStrict()[0].contentRange,
        boundary: pairInfo.getBoundaryStrict().map((t) => t.contentRange) as [
          Range,
          Range,
        ],
      };
    }

    pairInfo = getParentSurroundingPair(
      languageDefinition,
      context,
      target.editor,
      pairInfo,
    );
  }

  // We have not found a surrounding pair. Use the line.
  return {
    range: fitRangeToLineContent(target.editor, target.contentRange),
  };
}

function getParentSurroundingPair(
  languageDefinition: LanguageDefinition | undefined,
  context: ProcessedTargetsContext,
  editor: TextEditor,
  target: SurroundingPairTarget,
) {
  const startOffset = editor.document.offsetAt(target.contentRange.start);
  // Can't have a parent; already at start of document
  if (startOffset === 0) {
    return null;
  }
  // Step out of this pair and see if we have a parent
  const position = editor.document.positionAt(startOffset - 1);
  return getSurroundingPair(
    languageDefinition,
    context,
    new PlainTarget({
      editor,
      contentRange: new Range(position, position),
      isReversed: false,
    }),
  );
}

function getSurroundingPair(
  languageDefinition: LanguageDefinition | undefined,
  context: ProcessedTargetsContext,
  target: Target,
) {
  return processSurroundingPair(languageDefinition, context, target, {
    type: "surroundingPair",
    delimiter: "collectionBoundary",
    requireStrongContainment: true,
  });
}

function getStringSurroundingPair(
  languageDefinition: LanguageDefinition | undefined,
  context: ProcessedTargetsContext,
  target: Target,
) {
  return processSurroundingPair(languageDefinition, context, target, {
    type: "surroundingPair",
    delimiter: "string",
    requireStrongContainment: true,
  });
}
