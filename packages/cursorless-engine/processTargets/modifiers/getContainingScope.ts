import { TextEditor, Position } from "@cursorless/common";
import { Direction } from "@cursorless/common";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

/**
 * Gets the smallest containing scope, preferring scopes in direction
 * {@link direction}
 * @param scopeHandler
 * @param editor
 * @param position
 * @param direction
 * @returns
 */
export function getContainingScope(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction,
) {
  return getOne(
    scopeHandler.generateScopes(editor, position, direction, {
      containment: "required",
    }),
  );
}

function getOne<T>(iterable: Iterable<T>): T | undefined {
  const { value, done } = iterable[Symbol.iterator]().next();
  return done ? undefined : value;
}
