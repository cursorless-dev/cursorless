import { Position } from "@cursorless/common";
import type { SurroundingPairOccurrence } from "./types";

/**
 * Returns true if the position is inside the pair
 */
export function stronglyContains(
  position: Position,
  pair: SurroundingPairOccurrence,
) {
  return (
    position.isAfterOrEqual(pair.left.end) &&
    position.isBeforeOrEqual(pair.right.start)
  );
}
