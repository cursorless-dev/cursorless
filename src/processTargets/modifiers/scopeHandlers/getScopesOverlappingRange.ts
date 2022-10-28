import { Range, TextEditor } from "vscode";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default function getScopesOverlappingRange(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  { start, end }: Range,
): TargetScope[] {
  let seenScope = false;
  const scopes: TargetScope[] = [];
  for (const scope of scopeHandler.generateScopes(
    editor,
    start,
    "forward",
    { mustStartBefore: end },
  )) {
    if (seenScope && scope.domain.contains(start)) {
      continue;
    }

    seenScope = true;

    if (scope.domain.start.isAfterOrEqual(end)) {
      if (scope.domain.end.isEqual(end)) {
        scopes.push(scope);
      }

      return scopes;
    }

    scopes.push(scope);
  }

  return scopes;
}
