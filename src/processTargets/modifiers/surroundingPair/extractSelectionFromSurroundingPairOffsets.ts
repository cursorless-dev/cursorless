import { Range, Selection, TextDocument } from "vscode";
import { SelectionWithContext } from "../../../typings/Types";
import { SurroundingPairOffsets } from "./types";

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
  surroundingPairOffsets: SurroundingPairOffsets
): SelectionWithContext[] {
  const interior = new Range(
    document.positionAt(baseOffset + surroundingPairOffsets.leftDelimiter.end),
    document.positionAt(
      baseOffset + surroundingPairOffsets.rightDelimiter.start
    )
  );
  const boundary = [
    new Range(
      document.positionAt(
        baseOffset + surroundingPairOffsets.leftDelimiter.start
      ),
      document.positionAt(baseOffset + surroundingPairOffsets.leftDelimiter.end)
    ),
    new Range(
      document.positionAt(
        baseOffset + surroundingPairOffsets.rightDelimiter.start
      ),
      document.positionAt(
        baseOffset + surroundingPairOffsets.rightDelimiter.end
      )
    ),
  ];

  return [
    {
      selection: new Selection(
        document.positionAt(
          baseOffset + surroundingPairOffsets.leftDelimiter.start
        ),
        document.positionAt(
          baseOffset + surroundingPairOffsets.rightDelimiter.end
        )
      ),
      context: {
        boundary,
        interiorRange: interior,
      },
    },
  ];
}
