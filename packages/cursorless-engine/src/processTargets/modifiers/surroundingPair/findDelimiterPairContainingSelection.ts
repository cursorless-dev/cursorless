import {
  SimpleSurroundingPairName,
  SurroundingPairScopeType,
} from "@cursorless/common";
import { generateUnmatchedDelimiters } from "./generateUnmatchedDelimiters";
import { getSurroundingPairOffsets } from "./getSurroundingPairOffsets";
import {
  Offsets,
  PossibleDelimiterOccurrence,
  SurroundingPairOffsets,
} from "./types";

/**
 * Looks for a surrounding pair that contains the selection, returning null if none is found.
 *
 * Our approach is to first initialize two generators, one scanning rightwards
 * and one scanning leftwards.  The generator scanning rightwards starts at the
 * first delimiter whose end offset is greater than or equal to the end offset
 * of the selection.  The generator scanning leftwards starts at the token just
 * prior to the start token for the rightward scanner.
 *
 * We start with the right generator, proceeding until we find any acceptable
 * unmatched closing delimiter.  We then advance the left generator, looking
 * only for an unmatched opening delimiter that matches the closing delimiter
 * we found in our rightward scan.
 *
 * If the delimiter found by our leftward scan is before or equal to the start
 * of the selection, we return the delimiter pair.  If not, we loop back and
 * scan left / right again, repeating the process until our leftward or
 * rightward scan runs out of delimiters.
 *
 * @param initialIndex The index of the first delimiter to try within the delimiter occurrences list.  Expected to be
 * the index of the first delimiter whose end offset is greater than or equal to
 * the end offset of the selection.
 * @param delimiterOccurrences A list of delimiter occurrences.  Expected to be sorted by offsets
 * @param acceptableDelimiters A list of names of acceptable delimiters to look for
 * @param selectionOffsets The offsets of the selection
 * @returns The offsets of the surrounding pair containing the selection, or
 * null if none is found
 */
export function findDelimiterPairContainingSelection(
  initialIndex: number,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  acceptableDelimiters: SimpleSurroundingPairName[],
  selectionOffsets: Offsets,
  scopeType: SurroundingPairScopeType,
): SurroundingPairOffsets | null {
  // Accept any delimiter when scanning right
  const acceptableRightDelimiters = acceptableDelimiters;

  // When scanning left, we'll populate this list with just the delimiter we
  // found on our rightward pass.
  let acceptableLeftDelimiters: SimpleSurroundingPairName[] = [];

  const rightDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterOccurrences,
    initialIndex,
    () => acceptableRightDelimiters,
    true,
  );

  // Start just to the left of the delimiter we start from in our rightward
  // pass
  const leftDelimiterGenerator = generateUnmatchedDelimiters(
    delimiterOccurrences,
    initialIndex - 1,
    () => acceptableLeftDelimiters,
    false,
  );

  while (true) {
    // Scan right until we find an acceptable unmatched closing delimiter
    const rightNext = rightDelimiterGenerator.next();
    if (rightNext.done) {
      return null;
    }
    const rightDelimiterOccurrence = rightNext.value!;

    // Then scan left until we find an unmatched delimiter matching the
    // delimiter we found in our rightward pass.
    acceptableLeftDelimiters = [
      rightDelimiterOccurrence.delimiterInfo.delimiter,
    ];
    const leftNext = leftDelimiterGenerator.next();
    if (leftNext.done) {
      return null;
    }
    const leftDelimiterOccurrence = leftNext.value!;

    // If left delimiter is left of our selection, we return it.  Otherwise
    // loop back and continue scanning outwards.
    if (leftDelimiterOccurrence.offsets.start <= selectionOffsets.start) {
      if (
        scopeType.requireStrongContainment &&
        !(
          leftDelimiterOccurrence.offsets.end <= selectionOffsets.start &&
          rightDelimiterOccurrence.offsets.start >= selectionOffsets.end
        )
      ) {
        // If we require strong containment, continue searching for something
        // bigger if the selection overlaps either delimiter
        continue;
      }

      return getSurroundingPairOffsets(
        leftDelimiterOccurrence,
        rightDelimiterOccurrence,
      );
    }
  }
}
