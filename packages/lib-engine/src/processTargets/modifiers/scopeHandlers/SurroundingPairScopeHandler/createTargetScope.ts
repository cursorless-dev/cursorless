import type { TextEditor } from "@cursorless/common";
import { Range } from "@cursorless/common";
import { SurroundingPairTarget } from "../../../targets";
import type { TargetScope } from "../scope.types";
import type { SurroundingPairOccurrence } from "./types";

/**
 * Creates a target scope from a surrounding pair occurrence
 */
export function createTargetScope(
  editor: TextEditor,
  { openingDelimiterRange, closingDelimiterRange }: SurroundingPairOccurrence,
  requireStrongContainment: boolean,
): TargetScope {
  const fullRange = openingDelimiterRange.union(closingDelimiterRange);
  const interiorRange = new Range(
    openingDelimiterRange.end,
    closingDelimiterRange.start,
  );

  return {
    editor,
    domain: requireStrongContainment ? interiorRange : fullRange,
    getTargets: (isReversed) => [
      new SurroundingPairTarget({
        editor,
        isReversed,
        contentRange: fullRange,
        interiorRange,
        boundary: [openingDelimiterRange, closingDelimiterRange],
      }),
    ],
  };
}
