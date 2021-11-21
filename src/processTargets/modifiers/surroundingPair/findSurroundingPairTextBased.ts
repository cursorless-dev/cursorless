import { escapeRegExp, uniq } from "lodash";
import { Range, Selection, TextDocument, TextEditor } from "vscode";
import { Delimiter, DelimiterInclusion } from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { extractSelectionFromDelimiterIndices } from "./extractSelectionFromDelimiterIndices";
import { findSurroundingPairCore } from "./findSurroundingPairCore";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import { Offsets, PairIndices, PossibleDelimiterOccurrence } from "./types";

export function findSurroundingPairTextBased(
  editor: TextEditor,
  selection: Selection,
  allowableRange: Range | null,
  delimiter: Delimiter | null,
  delimiterInclusion: DelimiterInclusion
) {
  const document: TextDocument = editor.document;

  const allowableRangeStartOffset =
    allowableRange == null ? 0 : document.offsetAt(allowableRange.start);

  const selectionOffsets = {
    start: document.offsetAt(selection.start) - allowableRangeStartOffset,
    end: document.offsetAt(selection.end) - allowableRangeStartOffset,
  };

  const pairIndices = getDelimiterPairIndices(
    document.getText(allowableRange ?? undefined),
    selectionOffsets,
    delimiter
  );

  return pairIndices == null
    ? null
    : extractSelectionFromDelimiterIndices(
        document,
        allowableRangeStartOffset,
        pairIndices,
        delimiterInclusion
      ).map(({ selection, context }) => ({
        selection: { selection, editor },
        context,
      }));
}

export function getDelimiterPairIndices(
  text: string,
  selectionOffsets: Offsets,
  delimiter: Delimiter | null
): PairIndices | null {
  const individualDelimiters = getIndividualDelimiters(delimiter);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ])
  );

  const delimiterRegex = new RegExp(
    uniq(individualDelimiters.flatMap(({ text }) => [`\\${text}`, text]))
      .map(escapeRegExp)
      .join("|"),
    "gu"
  );

  const delimiterOccurrences: PossibleDelimiterOccurrence[] = matchAll(
    text,
    delimiterRegex,
    (match) => {
      const startOffset = match.index!;
      const text = match[0];
      return {
        offsets: {
          start: startOffset,
          end: startOffset + text.length,
        },
        get delimiterInfo() {
          return delimiterTextToDelimiterInfoMap[text];
        },
      };
    }
  );

  return findSurroundingPairCore(
    delimiterOccurrences,
    individualDelimiters,
    selectionOffsets
  );
}
