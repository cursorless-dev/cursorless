import {
  Direction,
  Position, TextDocument
} from "@cursorless/common";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

/**
 * Constructs a range to pass to {@link Query.matches} to find scopes. Note
 * that {@link Query.matches} will only return scopes that have non-empty
 * intersection with this range.  Also note that the base
 * {@link BaseScopeHandler.generateScopes} will filter out any extra scopes
 * that we yield, so we don't need to be totally precise.
 *
 * @returns Range to pass to {@link Query.matches}
 */
export function getQueryRange(
  document: TextDocument,
  position: Position,
  direction: Direction,
  { containment, distalPosition }: ScopeIteratorRequirements) {
  const offset = document.offsetAt(position);
  const distalOffset = distalPosition == null ? null : document.offsetAt(distalPosition);

  if (containment === "required") {
    // If containment is required, we smear the position left and right by one
    // character so that we have a non-empty intersection with any scope that
    // touches position
    return {
      start: document.positionAt(offset - 1),
      end: document.positionAt(offset + 1),
    };
  }

  // If containment is disallowed, we can shift the position forward by a character to avoid
  // matching scopes that touch position.  Otherwise, we shift the position backward by a
  // character to ensure we get scopes that touch position.
  const proximalShift = containment === "disallowed" ? 1 : -1;

  // FIXME: Don't go all the way to end of document when there is no distalPosition?
  // Seems wasteful to query all the way to end of document for something like "next funk"
  // Might be better to start smaller and exponentially grow
  return direction === "forward"
    ? {
      start: document.positionAt(offset + proximalShift),
      end: distalOffset == null
        ? document.range.end
        : document.positionAt(distalOffset + 1),
    }
    : {
      start: distalOffset == null
        ? document.range.start
        : document.positionAt(distalOffset - 1),
      end: document.positionAt(offset - proximalShift),
    };
}
