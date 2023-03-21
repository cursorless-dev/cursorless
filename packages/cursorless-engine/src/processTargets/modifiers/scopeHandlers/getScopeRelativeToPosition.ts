import { Position, TextEditor } from "@cursorless/common";
import { Direction } from "@cursorless/common";
import { OutOfRangeError } from "../targetSequenceUtils";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

/**
 * Runs the scope generator until `offset` scopes have been yielded and returns
 * that scope, only yielding scopes that start after or equal {@link position}
 * @param scopeHandler
 * @param editor
 * @param position
 * @param offset
 * @param direction
 * @returns
 */
export default function getScopeRelativeToPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  offset: number,
  direction: Direction,
): TargetScope {
  let scopeCount = 0;
  const iterator = scopeHandler.generateScopes(editor, position, direction, {
    containment: "disallowedIfStrict",
  });
  for (const scope of iterator) {
    scopeCount += 1;

    if (scopeCount === offset) {
      return scope;
    }
  }

  throw new OutOfRangeError();
}
