import type { Direction, Position } from "@cursorless/lib-common";
import { ensureSingleTarget } from "../../../../util/targetUtils";
import type { TargetScope } from "../scope.types";
import type { CustomScopeType } from "../scopeHandler.types";
import { SortedScopeHandler } from "../SortedScopeHandler";

export class CollectionItemCompoundScopeHandler extends SortedScopeHandler {
  private isIterator: boolean = false;

  get iterationScopeType(): CustomScopeType {
    if (this.iterationScopeHandler == null) {
      const iterationScopeHandlers = this.scopeHandlers.map((s) =>
        this.scopeHandlerFactory.create(s.iterationScopeType, this.languageId),
      );
      const iterationScopeHandler = new CollectionItemCompoundScopeHandler(
        this.scopeHandlerFactory,
        this.languageId,
        iterationScopeHandlers,
      );
      iterationScopeHandler.isIterator = true;
      this.iterationScopeHandler = iterationScopeHandler;
    }
    return {
      type: "custom",
      scopeHandler: this.iterationScopeHandler,
    };
  }

  protected override compareScopes(
    direction: Direction,
    position: Position,
    a: TargetScope,
    b: TargetScope,
  ): number {
    if (!this.isIterator) {
      return super.compareScopes(direction, position, a, b);
    }

    const intersection = a.domain.intersection(b.domain);

    if (intersection == null || intersection.isEmpty) {
      return super.compareScopes(direction, position, a, b);
    }

    const aIsLine = isLine(a);
    const bIsLine = isLine(b);

    // Prefer non-line targets over line targets
    if (aIsLine !== bIsLine) {
      return Number(aIsLine) - Number(bIsLine);
    }

    return super.compareScopes(direction, position, a, b);
  }
}

function isLine(scope: TargetScope): boolean {
  return ensureSingleTarget(scope.getTargets(false)).textualType === "line";
}
