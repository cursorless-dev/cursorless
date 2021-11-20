import { Selection, TextDocument } from "vscode";
import { DelimiterInclusion, SelectionWithContext } from "../../../typings/Types";
import { PairIndices } from "./types";

export function extractSelectionFromDelimiterIndices(
  document: TextDocument,
  allowableRangeStartOffset: number,
  delimiterIndices: PairIndices,
  delimiterInclusion: DelimiterInclusion): SelectionWithContext[] {
  switch (delimiterInclusion) {
    case "includeDelimiters":
      return [
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.start
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.end
            )
          ),
          context: {},
        },
      ];
    case "excludeDelimiters":
      return [
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.end
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.start
            )
          ),
          context: {},
        },
      ];
    case "delimitersOnly":
      return [
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.start
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.leftDelimiter.end
            )
          ),
          context: {},
        },
        {
          selection: new Selection(
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.start
            ),
            document.positionAt(
              allowableRangeStartOffset + delimiterIndices.rightDelimiter.end
            )
          ),
          context: {},
        },
      ];
  }
}
