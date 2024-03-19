import { Range, TextDocument, TextEditor } from "@cursorless/common";
import { escapeRegExp, findLast, uniq } from "lodash";
import { matchAll } from "../../../util/regex";
import {
  SimpleSurroundingPairName,
  SurroundingPairName,
  SurroundingPairScopeType,
} from "@cursorless/common";
import { extractSelectionFromSurroundingPairOffsets } from "./extractSelectionFromSurroundingPairOffsets";
import { findSurroundingPairCore } from "./findSurroundingPairCore";
import { getIndividualDelimiters } from "./getIndividualDelimiters";
import {
  IndividualDelimiter,
  Offsets,
  PossibleDelimiterOccurrence,
  SurroundingPairOffsets,
} from "./types";

/**
 * The initial range length that we start by scanning
 */
const INITIAL_SCAN_LENGTH = 200;

/**
 * The maximum range we're willing to scan
 */
const MAX_SCAN_LENGTH = 50000;

/**
 * The factor by which to expand the search range at each iteration
 */
const SCAN_EXPANSION_FACTOR = 3;

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
 * @param range The selection to find surrounding pair around
 * @param allowableRange The range in which to look for delimiters, or the
 * entire document if `null`
 * @param delimiters The acceptable surrounding pair names
 * @returns The newly expanded selection, including editor info
 */
export function findSurroundingPairTextBased(
  editor: TextEditor,
  range: Range,
  allowableRange: Range | null,
  delimiters: SimpleSurroundingPairName[],
  scopeType: SurroundingPairScopeType,
) {
  const document: TextDocument = editor.document;
  const fullRange = allowableRange ?? document.range;

  const individualDelimiters = getIndividualDelimiters(
    editor.document.languageId,
    delimiters,
  );

  const delimiterTextToDelimiterInfoMap = Object.fromEntries(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.text,
      individualDelimiter,
    ]),
  );

  /**
   * Regex to use to find delimiters
   */
  const delimiterRegex = getDelimiterRegex(individualDelimiters);

  /**
   * The offset of the allowable range within the document.  All offsets are
   * taken relative to this range.
   */
  const fullRangeOffsets = {
    start: document.offsetAt(fullRange.start),
    end: document.offsetAt(fullRange.end),
  };
  const selectionOffsets = {
    start: document.offsetAt(range.start),
    end: document.offsetAt(range.end),
  };

  /**
   * Context to pass to nested call
   */
  const context: Context = {
    scopeType,
    delimiterRegex,
    delimiters,
    delimiterTextToDelimiterInfoMap,
  };

  for (
    let scanLength = INITIAL_SCAN_LENGTH;
    scanLength < MAX_SCAN_LENGTH;
    scanLength *= SCAN_EXPANSION_FACTOR
  ) {
    /**
     * The current range in which to look. Here we take the full range and
     * restrict it based on the current scan length
     */
    const currentRangeOffsets = {
      start: Math.max(
        fullRangeOffsets.start,
        selectionOffsets.end - scanLength / 2,
      ),
      end: Math.min(
        fullRangeOffsets.end,
        selectionOffsets.end + scanLength / 2,
      ),
    };

    const currentRange = new Range(
      document.positionAt(currentRangeOffsets.start),
      document.positionAt(currentRangeOffsets.end),
    );

    // Just bail early if the range doesn't completely contain our selection as
    // it is a lost cause.
    if (!currentRange.contains(range)) {
      continue;
    }

    // Here we apply the core algorithm. This algorithm operates relative to the
    // string that it receives so we need to adjust the selection range before
    // we pass it in and then later we will adjust to the offsets that it
    // returns
    const adjustedSelectionOffsets = {
      start: selectionOffsets.start - currentRangeOffsets.start,
      end: selectionOffsets.end - currentRangeOffsets.start,
    };

    const pairOffsets = getDelimiterPairOffsets(
      context,
      document.getText(currentRange),
      adjustedSelectionOffsets,
      currentRangeOffsets.start === fullRangeOffsets.start,
      currentRangeOffsets.end === fullRangeOffsets.end,
    );

    if (pairOffsets != null) {
      // And then perform postprocessing
      return extractSelectionFromSurroundingPairOffsets(
        document,
        currentRangeOffsets.start,
        pairOffsets,
      );
    }

    // If the current range is greater than are equal to the full range then we
    // should stop expanding
    if (currentRange.contains(fullRange)) {
      break;
    }
  }

  return null;
}

function getDelimiterRegex(individualDelimiters: IndividualDelimiter[]) {
  // Create a regex which is a disjunction of all possible left / right
  // delimiter texts
  const individualDelimiterDisjunct = uniq(
    individualDelimiters.map(({ text }) => text),
  )
    .map(escapeRegExp)
    .join("|");

  // Then make sure that we don't allow preceding `\`
  return new RegExp(`(?<!\\\\)(${individualDelimiterDisjunct})`, "gu");
}

/**
 * Context to pass to nested call
 */
interface Context {
  scopeType: SurroundingPairScopeType;
  delimiterTextToDelimiterInfoMap: {
    [k: string]: IndividualDelimiter;
  };
  delimiterRegex: RegExp;

  /**
   * The allowable delimiter names
   */
  delimiters: SimpleSurroundingPairName[];
}

/**
 * Generate a list of possible delimiters and pass to the core algorithm.
 *
 * @param context Extra context to be used by this function
 * @param text The text in which to look for delimiters
 * @param selectionOffsets The offsets of the selection
 * @param isAtStartOfFullRange Indicates whether the current range is at the
 * start of the full range that we are willing to consider
 * @param isAtEndOfFullRange Indicates whether the current range is at the
 * end of the full range that we are willing to consider
 * @returns The offsets of the matching surrounding pair, or `null` if none is
 * found
 */
function getDelimiterPairOffsets(
  context: Context,
  text: string,
  selectionOffsets: Offsets,
  isAtStartOfFullRange: boolean,
  isAtEndOfFullRange: boolean,
): SurroundingPairOffsets | null {
  const {
    scopeType,
    delimiterTextToDelimiterInfoMap,
    delimiterRegex,
    delimiters,
  } = context;
  const { forceDirection } = scopeType;

  // XXX: The below is a bit wasteful when there are multiple targets, because
  // this whole function gets run once per target, so we're re-running this
  // regex tokenization for every one, but could probably just run it once.
  /**
   * A list of delimiter occurrences to pass to the core algorithm
   */
  const delimiterOccurrences: PossibleDelimiterOccurrence[] = matchAll(
    text,
    delimiterRegex,
    (match, index) => {
      const startOffset = match.index!;
      const matchText = match[0];

      // NB: It is important to cache here because otherwise the algorithm that
      // disambiguates delimiters of unknown side goes badly super linear
      let hasCachedDelimiterInfo = false;
      let cachedDelimiterInfo: IndividualDelimiter | undefined = undefined;

      return {
        offsets: {
          start: startOffset,
          end: startOffset + matchText.length,
        },

        get delimiterInfo() {
          if (hasCachedDelimiterInfo) {
            return cachedDelimiterInfo;
          }

          const rawDelimiterInfo = delimiterTextToDelimiterInfoMap[matchText];

          const side =
            rawDelimiterInfo.side === "unknown" && forceDirection == null
              ? inferDelimiterSide(
                  text,
                  delimiterOccurrences,
                  index,
                  rawDelimiterInfo?.delimiter,
                  startOffset,
                )
              : rawDelimiterInfo.side;

          const delimiterInfo = { ...rawDelimiterInfo, side };

          hasCachedDelimiterInfo = true;
          cachedDelimiterInfo = delimiterInfo;

          return delimiterInfo;
        },
      };
    },
  );

  // Then just run core algorithm
  const surroundingPair = findSurroundingPairCore(
    scopeType,
    delimiterOccurrences,
    delimiters,
    selectionOffsets,
    !isAtStartOfFullRange || !isAtEndOfFullRange,
  );

  // If we're not at the start of the full range, or we're not at the end of the
  // full range then we get nervous if the delimiter we found is at the end of
  // the range which is not complete, because we might have cut a token in half.
  // In this case we return null and let the next iteration handle it using a
  // larger range.
  if (
    surroundingPair == null ||
    (!isAtStartOfFullRange && surroundingPair.leftDelimiter.start === 0) ||
    (!isAtEndOfFullRange &&
      surroundingPair.rightDelimiter.end === text.length - 1)
  ) {
    return null;
  }

  return surroundingPair;
}

/**
 * Attempts to infer the side of a given delimiter of unknown side by using a
 * simple heuristic.
 *
 * If there is a delimiter of the same type preceding the given delimiter on the
 * same line then this delimiter will be of opposite side. If there is no
 * delimiter proceeding this one on the same line then this delimiter will be
 * considered a left delimiter.
 *
 * Note that this effectively ends up becoming a recursive algorithm because
 * when we ask the proceeding delimiter what side it is it will use this same
 * algorithm, which will then look to its left.
 *
 * NB: We must be careful in this algorithm not to access the delimiter info of
 * the current delimiter by using the `delimiterOccurrences` list because that
 * will result in infinite recursion because this function is called when we
 * lazily construct the delimiter info.
 *
 * @param fullText The full text containing the delimiters
 * @param delimiterOccurrences A list of all delimiter occurrences
 * @param index The index of the current delimiter in the delimiter list
 * @param delimiter The current delimiter type
 * @param occurrenceStartOffset The start offset of the current delimiter within
 * the full text
 * @returns The inferred side of the delimiter
 */
function inferDelimiterSide(
  fullText: string,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  index: number,
  delimiter: SurroundingPairName,
  occurrenceStartOffset: number,
) {
  const previousOccurrence =
    index === 0
      ? null
      : findLast(
          delimiterOccurrences,
          (delimiterOccurrence) =>
            delimiterOccurrence.delimiterInfo?.delimiter === delimiter,
          index - 1,
        );

  if (
    previousOccurrence == null ||
    fullText
      .substring(previousOccurrence.offsets.end, occurrenceStartOffset)
      .includes("\n")
  ) {
    return "left";
  }

  return previousOccurrence.delimiterInfo!.side === "left" ? "right" : "left";
}
