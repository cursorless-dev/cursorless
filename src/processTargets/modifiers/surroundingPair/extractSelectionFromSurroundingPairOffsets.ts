import { Selection, TextDocument } from "vscode";
import {
  DelimiterInclusion,
  SelectionWithContext,
} from "../../../typings/Types";
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
  surroundingPairOffsets: SurroundingPairOffsets,
  delimiterInclusion: DelimiterInclusion
): SelectionWithContext[] {
  if (delimiterInclusion == null) {
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
        context: {},
      },
    ];
  }

  switch (delimiterInclusion) {
    case "interiorOnly":
      return [
        {
          selection: new Selection(
            document.positionAt(
              baseOffset + surroundingPairOffsets.leftDelimiter.end
            ),
            document.positionAt(
              baseOffset + surroundingPairOffsets.rightDelimiter.start
            )
          ),
          context: {},
        },
      ];
    case "excludeInterior":
      return [
        {
          selection: new Selection(
            document.positionAt(
              baseOffset + surroundingPairOffsets.leftDelimiter.start
            ),
            document.positionAt(
              baseOffset + surroundingPairOffsets.leftDelimiter.end
            )
          ),
          context: {},
        },
        {
          selection: new Selection(
            document.positionAt(
              baseOffset + surroundingPairOffsets.rightDelimiter.start
            ),
            document.positionAt(
              baseOffset + surroundingPairOffsets.rightDelimiter.end
            )
          ),
          context: {},
        },
      ];
  }
}
