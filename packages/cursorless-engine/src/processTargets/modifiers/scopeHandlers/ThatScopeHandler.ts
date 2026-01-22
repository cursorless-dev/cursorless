import type { Direction, ScopeType } from "@cursorless/common";
import type { StoredTargetMap } from "../../../core/StoredTargets";
import { TokenTarget } from "../../targets";
import { NestedScopeHandler } from "./NestedScopeHandler";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import type { TargetScope } from "./scope.types";

/**
 * Scope handler that returns the range(s) from the "that" mark.
 * The "that" mark stores the targets from the most recent Cursorless command.
 */
export class ThatScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "that" } as const;
  public readonly iterationScopeType: ScopeType = { type: "document" };

  constructor(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: ScopeType,
    languageId: string,
    private storedTargets: StoredTargetMap,
  ) {
    super(scopeHandlerFactory, scopeType, languageId);
  }

  protected *generateScopesInSearchScope(
    _direction: Direction,
    { editor }: TargetScope,
  ): Iterable<TargetScope> {
    // Get the targets stored in the "that" mark
    const thatTargets = this.storedTargets.get("that");

    if (thatTargets == null || thatTargets.length === 0) {
      // No "that" mark available, yield nothing
      return;
    }

    // Filter targets to only those in the current editor
    const editorTargets = thatTargets.filter(
      (target) => target.editor.id === editor.id,
    );

    // Yield a TargetScope for each target
    for (const target of editorTargets) {
      yield {
        editor: target.editor,
        domain: target.contentRange,
        getTargets: (isReversed) => [
          new TokenTarget({
            editor: target.editor,
            contentRange: target.contentRange,
            isReversed,
          }),
        ],
      };
    }
  }
}
