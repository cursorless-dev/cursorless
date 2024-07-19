import { Range, TextEditor, TextLine } from "@cursorless/common";
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

  // Iteration is necessary in case of in valid surrounding targets (nested strings, content range adjacent to delimiter)
  while (surroundingTarget != null) {
    if (
      useInteriorOfSurroundingTarget(
        languageDefinitions,
        target,
        surroundingTarget,
      )
    ) {
      return {
        range: surroundingTarget.getInterior()[0].contentRange,
        boundary: getBoundary(surroundingTarget),
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

function useInteriorOfSurroundingTarget(
  languageDefinitions: LanguageDefinitions,
  target: Target,
  surroundingTarget: SurroundingPairTarget,
): boolean {
  const { contentRange } = target;

  if (contentRange.isEmpty) {
    const [left, right] = getBoundary(surroundingTarget);
    const pos = contentRange.start;
    // Content range is outside adjacent to pair
    if (pos.isEqual(left.start) || pos.isEqual(right.end)) {
      return false;
    }
    const line = target.editor.document.lineAt(pos);
    // Content range is just inside of opening/left delimiter
    if (
      pos.isEqual(left.end) &&
      characterIsWhitespaceOrMissing(line, pos.character)
    ) {
      return false;
    }
    // Content range is just inside of closing/right delimiter
    if (
      pos.isEqual(right.start) &&
      characterIsWhitespaceOrMissing(line, pos.character - 1)
    ) {
      return false;
    }
  } else {
    // Content range is equal to surrounding range
    if (contentRange.isRangeEqual(surroundingTarget.contentRange)) {
      return false;
    }

    // Content range is equal to one of the boundaries of the surrounding range
    const [left, right] = getBoundary(surroundingTarget);
    if (contentRange.isRangeEqual(left) || contentRange.isRangeEqual(right)) {
      return false;
    }
  }

  // We don't look for items inside strings.
  // A non-string surrounding pair that is inside a surrounding string is fine.
  const surroundingStringTarget = getStringSurroundingPair(
    languageDefinitions,
    surroundingTarget,
  );
  if (
    surroundingStringTarget != null &&
    surroundingTarget.contentRange.start.isBeforeOrEqual(
      surroundingStringTarget.contentRange.start,
    )
  ) {
    return false;
  }

  return true;
}

function getBoundary(surroundingTarget: SurroundingPairTarget): [Range, Range] {
  return surroundingTarget.getBoundary().map((t) => t.contentRange) as [
    Range,
    Range,
  ];
}

function characterIsWhitespaceOrMissing(
  line: TextLine,
  index: number,
): boolean {
  return (
    index < line.range.start.character ||
    index >= line.range.end.character ||
    line.text[index].trim() === ""
  );
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
