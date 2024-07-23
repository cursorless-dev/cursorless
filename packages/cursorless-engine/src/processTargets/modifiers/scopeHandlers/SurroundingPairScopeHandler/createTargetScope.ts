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
  requireStrongContainment: boolean,
): TargetScope {
  const contentRange = new Range(left.start, right.end);
  const interiorRange = new Range(left.end, right.start);

  return {
    editor,
    domain: requireStrongContainment ? interiorRange : contentRange,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        isReversed,
        contentRange,
        interiorRange,
        boundary: [left, right],
      }),
    ],
  };
}
