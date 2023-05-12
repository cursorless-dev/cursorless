import { Range, TextEditor } from "@cursorless/common";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

/**
 * Returns a list of all scopes that have nonempty overlap with {@link range}.
 * @param scopeHandler
 * @param editor
 * @param param2
 * @returns
 */
export function getScopesOverlappingRange(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  { start, end }: Range,
): TargetScope[] {
  return Array.from(
    scopeHandler.generateScopes(editor, start, "forward", {
      distalPosition: end,
      maxAncestorIndex: 0,
    }),
  );
}
