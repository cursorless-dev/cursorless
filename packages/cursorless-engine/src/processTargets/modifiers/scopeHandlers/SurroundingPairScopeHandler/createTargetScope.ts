import { Range, TextEditor } from "@cursorless/common";
import { SurroundingPairTarget } from "../../../targets";
import { TargetScope } from "../scope.types";
import type { SurroundingPairOccurrence } from "./types";

/**
 * Creates a target scope from a surrounding pair occurrence
 */
export function createTargetScope(
  editor: TextEditor,
  pair: SurroundingPairOccurrence,
): TargetScope {
  const contentRange = new Range(pair.leftStart, pair.rightEnd);
  const interiorRange = new Range(pair.leftEnd, pair.rightStart);
  const leftRange = new Range(pair.leftStart, pair.leftEnd);
  const rightRange = new Range(pair.rightStart, pair.rightEnd);

  return {
    editor,
    domain: contentRange,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        isReversed,
        contentRange,
        interiorRange,
        boundary: [leftRange, rightRange],
      }),
    ],
  };
}
