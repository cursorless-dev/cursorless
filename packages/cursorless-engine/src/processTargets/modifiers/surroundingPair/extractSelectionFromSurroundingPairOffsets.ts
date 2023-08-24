import type { TextDocument } from "@cursorless/common";
import { Range, Selection } from "@cursorless/common";
import type { SurroundingPairOffsets } from "./types";

export interface SurroundingPairInfo {
  contentRange: Selection;
  boundary: [Range, Range];
  interiorRange: Range;
}

/**
 * Given offsets describing a surrounding pair, returns a selection
 *
 * @param document The document containing the pairs
 * @param baseOffset The base offset to be added to all given offsets
 * @param surroundingPairOffsets A pair of start/end offsets corresponding to a delimiter pair
 * @param delimiterInclusion Whether to include / exclude the delimiters themselves
 * @returns A selection corresponding to the delimiter pair
 */
export function extractSelectionFromSurroundingPairOffsets(
  document: TextDocument,
  baseOffset: number,
  surroundingPairOffsets: SurroundingPairOffsets,
): SurroundingPairInfo {
  const interior = new Range(
    document.positionAt(baseOffset + surroundingPairOffsets.leftDelimiter.end),
    document.positionAt(
      baseOffset + surroundingPairOffsets.rightDelimiter.start,
    ),
  );
  const boundary: [Range, Range] = [
    new Range(
      document.positionAt(
        baseOffset + surroundingPairOffsets.leftDelimiter.start,
      ),
      document.positionAt(
        baseOffset + surroundingPairOffsets.leftDelimiter.end,
      ),
    ),
    new Range(
      document.positionAt(
        baseOffset + surroundingPairOffsets.rightDelimiter.start,
      ),
      document.positionAt(
        baseOffset + surroundingPairOffsets.rightDelimiter.end,
      ),
    ),
  ];

  return {
    contentRange: new Selection(
      document.positionAt(
        baseOffset + surroundingPairOffsets.leftDelimiter.start,
      ),
      document.positionAt(
        baseOffset + surroundingPairOffsets.rightDelimiter.end,
      ),
    ),
    boundary,
    interiorRange: interior,
  };
}
