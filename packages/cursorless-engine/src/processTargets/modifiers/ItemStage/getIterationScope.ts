import { Range, TextEditor } from "@cursorless/common";
import { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
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
  languageDefinitions: LanguageDefinitions,
  target: Target,
): { range: Range; boundary?: [Range, Range] } {
  let surroundingTarget = getSurroundingPair(languageDefinitions, target);

  // Iteration is necessary in case of nested strings
  while (surroundingTarget != null) {
    const surroundingStringTarget = getStringSurroundingPair(
      languageDefinitions,
      surroundingTarget,
    );

    // We don't look for items inside strings.
    if (
      // Not in a string
      surroundingStringTarget == null ||
      // In a non-string surrounding pair that is inside a surrounding string. This is fine.
      surroundingStringTarget.contentRange.start.isBefore(
        surroundingTarget.contentRange.start,
      )
    ) {
      return {
        range: surroundingTarget.getInteriorStrict()[0].contentRange,
        boundary: surroundingTarget
          .getBoundaryStrict()
          .map((t) => t.contentRange) as [Range, Range],
      };
    }

    surroundingTarget = getParentSurroundingPair(
      languageDefinitions,
      target.editor,
      surroundingTarget,
    );
  }

  // We have not found a surrounding pair. Use the line.
  return {
    range: fitRangeToLineContent(target.editor, target.contentRange),
  };
}

function getParentSurroundingPair(
  languageDefinitions: LanguageDefinitions,
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
    languageDefinitions,
    new PlainTarget({
      editor,
      contentRange: new Range(position, position),
      isReversed: false,
    }),
  );
}

function getSurroundingPair(
  languageDefinitions: LanguageDefinitions,
  target: Target,
) {
  return processSurroundingPair(languageDefinitions, target, {
    type: "surroundingPair",
    delimiter: "collectionBoundary",
    requireStrongContainment: true,
  });
}

function getStringSurroundingPair(
  languageDefinitions: LanguageDefinitions,
  target: Target,
) {
  return processSurroundingPair(languageDefinitions, target, {
    type: "surroundingPair",
    delimiter: "string",
    requireStrongContainment: true,
  });
}
