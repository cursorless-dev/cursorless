import type { Direction } from "@cursorless/common";
import { NestedScopeHandler } from ".";
import { NotebookCellTarget } from "../../targets";
import { TargetScope } from "./scope.types";

export default class NotebookCellScopeHandler extends NestedScopeHandler {
  public readonly iterationScopeType = { type: "document" } as const;

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
