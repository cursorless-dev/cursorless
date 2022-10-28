import { Direction } from "../../typings/targetDescriptor.types";
import { TextEditor, Position } from "vscode";
import { ScopeHandler } from "./scopeHandlers/scopeHandler.types";

export function getContainingScope(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  direction: Direction) {
  return getOne(
    scopeHandler.generateScopes(editor, position, direction, {
      containment: "required",
    })
  );
}
function getOne<T>(iterable: Iterable<T>): T | undefined {
  const { value, done } = iterable[Symbol.iterator]().next();
  return done ? undefined : value;
}
