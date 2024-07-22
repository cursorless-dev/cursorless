import { Range, TextEditor } from "@cursorless/common";
import { SurroundingPairTarget } from "../../../targets";
import { TargetScope } from "../scope.types";
import type { SurroundingPairOccurrence } from "./types";

/**
 * Creates a target scope from a surrounding pair occurrence
 */
export function createTargetScope(
  editor: TextEditor,
  { left, right }: SurroundingPairOccurrence,
): TargetScope {
  const contentRange = new Range(left.start, right.end);

  return {
    editor,
    domain: contentRange,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        isReversed,
        contentRange,
        interiorRange: new Range(left.end, right.start),
        boundary: [left, right],
      }),
    ],
  };
}
