import { escapeRegExp, uniq } from "lodash";
import { Range, Selection, TextDocument, TextEditor } from "vscode";
import {
  SimpleSurroundingPairName,
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

/**
 * Implements the version of the surrounding pair finding algorithm that
 * just looks at text.  We use this algorithm when we are in a language
 * for which we do not have parser support, or if we have parse tree support
 * but the selection is in a string or comment.
 *
 * The approach is to create a list of candidate delimiters in the given range,
 * and then pass them to the core algorithm, implemented by
 * findSurroundingPairCore.
 *
 * To generate a list of delimiters to pass to findSurroundingPairCore, we
 * run a regex on the entire range to find all delimiter texts, using a
 * negative lookbehind to ensure they're not preceded by `\`.
 *
 * The main drawbacks of the text-based approach are the following:
 *
 * - We can get confused by delimiters whose opening and closing symbol is the
 * same (eg `"`).  Without a parse tree we have to guess whether it is an
 * opening or closing quote.
 * - We need to parse the whole range  from the start because otherwise it is
 * difficult to handle the case where one delimiter text is a subset of
 * another, eg `"` and `\"`.  We could handle this another way if performance
 * becomes a bottleneck.
 * - We cannot understand special features of a language, eg that `f"` is a
 * form of opening quote in Python.
 *
 * @param editor The text editor containing the selection
 * @param selection The selection to find surrounding pair around
 * @param allowableRange The range in which to look for delimiters, or the
 * entire document if `null`
 * @param delimiters The acceptable surrounding pair names
 * @param delimiterInclusion Whether to include / exclude the delimiters themselves
 * @returns The newly expanded selection, including editor info
 */
export function findSurroundingPairTextBased(
  editor: TextEditor,
  selection: Selection,
  allowableRange: Range | null,
  delimiters: SimpleSurroundingPairName[],
  delimiterInclusion: DelimiterInclusion
) {
  const document: TextDocument = editor.document;

  /**
   * The offset of the allowable range within the document.  All offsets are
   * taken relative to this range.
   */
  const allowableRangeStartOffset =
    allowableRange == null ? 0 : document.offsetAt(allowableRange.start);

  const selectionOffsets = {
    start: document.offsetAt(selection.start) - allowableRangeStartOffset,
    end: document.offsetAt(selection.end) - allowableRangeStartOffset,
  };

  // Here we apply the core algorithm
  const pairOffsets = getDelimiterPairOffsets(
    document.getText(allowableRange ?? undefined),
    selectionOffsets,
    delimiters
  );

  // And then perform postprocessing
  return pairOffsets == null
    ? null
    : extractSelectionFromSurroundingPairOffsets(
        document,
        allowableRangeStartOffset,
        pairOffsets,
        delimiterInclusion
      ).map(({ selection, context }) => ({
        selection: { selection, editor },
        context,
      }));
}

/**
 * Generate a list of possible delimiters and pass to the core algorithm.
 *
 * @param text The text in which to look for delimiters
 * @param selectionOffsets The offsets of the selection
 * @param delimiters The allowabe delimiter names
 * @returns The offsets of the matching surrounding pair, or `null` if none is
 * found
 */
export function getDelimiterPairOffsets(
  text: string,
  selectionOffsets: Offsets,
  delimiters: SimpleSurroundingPairName[]
): SurroundingPairOffsets | null {
  const individualDelimiters = getIndividualDelimiters(delimiters);

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ])
  );

  // Create a regex which is a disjunction of all possible left / right
  // delimiter texts
  const individualDelimiterDisjunct = uniq(
    individualDelimiters.map(({ text }) => text)
  )
    .map(escapeRegExp)
    .join("|");

  // Then make sure that we don't allow preceding `\`
  const delimiterRegex = new RegExp(
    `(?<!\\\\)(${individualDelimiterDisjunct})`,
    "gu"
  );

  // XXX: The below is a bit wasteful when there are multiple targets, because
  // this whole function gets run once per target, so we're re-running this
  // regex tokenization for every one, but could probably just run it once.
  /**
   * A list of delimiter occurrences to pass to the core algorithm
   */
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

  // Then just run core algorithm
  return findSurroundingPairCore(
    delimiterOccurrences,
    delimiters,
    selectionOffsets
  );
}
