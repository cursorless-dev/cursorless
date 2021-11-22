import { escapeRegExp, uniq } from "lodash";
import { Range, Selection, TextDocument, TextEditor } from "vscode";
import {
  SurroundingPairName,
  DelimiterInclusion,
} from "../../../typings/Types";
import { matchAll } from "../../../util/regex";
import { extractSelectionFromSurroundingPairOffsets } from "./extractSelectionFromSurroundingPairOffsets";
import { findSurroundingPairCore } from "./findSurroundingPairCore";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import {
  Offsets,
  SurroundingPairOffsets,
  PossibleDelimiterOccurrence,
} from "./types";

export function findSurroundingPairTextBased(
  editor: TextEditor,
  selection: Selection,
  allowableRange: Range | null,
  delimiters: SurroundingPairName[],
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
    delimiters
  );

  return pairIndices == null
    ? null
    : extractSelectionFromSurroundingPairOffsets(
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
  delimiters: SurroundingPairName[]
): SurroundingPairOffsets | null {
  const individualDelimiters = getIndividualDelimiters(delimiters);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ])
  );

  const individualDelimiterDisjunct = uniq(
    individualDelimiters.map(({ text }) => text)
  )
    .map(escapeRegExp)
    .join("|");
  const delimiterRegex = new RegExp(
    `(?<!\\\\)(${individualDelimiterDisjunct})`,
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
    delimiters,
    selectionOffsets
  );
}
