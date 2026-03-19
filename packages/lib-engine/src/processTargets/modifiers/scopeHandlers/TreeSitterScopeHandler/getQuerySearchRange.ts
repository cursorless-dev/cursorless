import type { Direction, Position, TextDocument } from "@cursorless/common";
import type {
  ContainmentPolicy,
  ScopeIteratorRequirements,
} from "../scopeHandler.types";

/**
 * Constructs a range to pass to {@link Query.matches} to find scopes. Note
 * that {@link Query.matches} will only return scopes that have non-empty
 * intersection with this range.  Also note that the base
 * {@link BaseScopeHandler.generateScopes} will filter out any extra scopes
 * that we yield, so we don't need to be totally precise.
 *
 * @returns Range to pass to {@link Query.matches}
 */
export function getQuerySearchRange(
  document: TextDocument,
  position: Position,
  direction: Direction,
  {
    containment,
    distalPosition,
    allowAdjacentScopes,
  }: ScopeIteratorRequirements,
) {
  const { start, end } = getQuerySearchRangeCore(
    document.offsetAt(position),
    document.offsetAt(distalPosition),
    direction,
    containment,
    allowAdjacentScopes,
  );

  return {
    start: document.positionAt(start),
    end: document.positionAt(end),
  };
}

/** Helper function for {@link getQuerySearchRange} */
function getQuerySearchRangeCore(
  offset: number,
  distalOffset: number,
  direction: Direction,
  containment: ContainmentPolicy | null,
  allowAdjacentScopes: boolean,
) {
  /**
   * If we allow adjacent scopes, we need to shift some of our offsets by one
   * character
   */
  const adjacentShift = allowAdjacentScopes ? 1 : 0;

  if (containment === "required") {
    // If containment is required, we smear the position left and right by one
    // character so that we have a non-empty intersection with any scope that
    // touches position.  Note that we can skip shifting the initial position
    // if we disallow adjacent scopes.
    return direction === "forward"
      ? {
          start: offset - adjacentShift,
          end: offset + 1,
        }
      : {
          start: offset - 1,
          end: offset + adjacentShift,
        };
  }

  // If containment is disallowed, we can shift the position forward by a
  // character to avoid matching scopes that touch position. Otherwise, we
  // shift the position backward by a character to ensure we get scopes that
  // touch position, if we allow adjacent scopes.
  const proximalShift = containment === "disallowed" ? 1 : -adjacentShift;

  // FIXME: Don't go all the way to end of document when there is no
  // distalOffset? Seems wasteful to query all the way to end of document for
  // something like "next funk". Might be better to start smaller and
  // exponentially grow
  return direction === "forward"
    ? {
        start: offset + proximalShift,
        end: distalOffset + adjacentShift,
      }
    : {
        start: distalOffset - adjacentShift,
        end: offset - proximalShift,
      };
}
