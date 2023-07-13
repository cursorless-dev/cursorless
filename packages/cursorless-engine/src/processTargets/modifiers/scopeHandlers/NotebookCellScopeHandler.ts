import type { Direction, ScopeType } from "@cursorless/common";
import { NestedScopeHandler } from ".";
import { NotebookCellTarget } from "../../targets";
import { TargetScope } from "./scope.types";

export default class NotebookCellScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "notebookCell" } as const;

  get iterationScopeType(): ScopeType {
    throw new Error(`Every ${this.scopeType} not yet implemented`);
  }

  protected *generateScopesInSearchScope(
    direction: Direction,
    { editor, domain }: TargetScope,
  ): Iterable<TargetScope> {
    yield {
      editor,
      domain,
      getTargets: (isReversed) => [
        new NotebookCellTarget({
          editor,
          isReversed,
          contentRange: domain,
        }),
      ],
    };
  }
}
