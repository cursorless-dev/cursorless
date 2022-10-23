import { Position, Range, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import {
  Direction,
  OneOfScopeType,
} from "../../../typings/targetDescriptor.types";
import type { IterationScope, Scope, TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class OneOfScopeHandler implements ScopeHandler {
  iterationScopeType = undefined;

  constructor(
    public readonly scopeType: OneOfScopeType,
    private languageId: string
  ) {}

  /** Return smallest target scope touching position */
  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex?: number
  ): TargetScope[] {
    const targetScopes = this.getsScopeHandlers().flatMap((scopeHandler) =>
      scopeHandler.getScopesTouchingPosition(editor, position, ancestorIndex)
    );
    targetScopes.sort(scopeComparator);
    return [targetScopes[0]];
  }

  /** Return all scopes overlapping range not contained by another scope */
  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    const targetScopes = this.getsScopeHandlers().flatMap((scopeHandler) =>
      scopeHandler.getScopesOverlappingRange(editor, range)
    );
    return targetScopes.filter(
      (targetScope) =>
        !targetScopes.find((s) => s.domain.contains(targetScope.domain))
    );
  }

  /** Returns smallest iteration scope touching position */
  getIterationScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[] {
    const iterationScopes = this.getsScopeHandlers().flatMap((scopeHandler) =>
      scopeHandler.getIterationScopesTouchingPosition(editor, position)
    );
    iterationScopes.sort(scopeComparator);
    return [iterationScopes[0]];
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): TargetScope {
    throw new Error("not implemented");
    // const scopeType=this.scopeType.scopeTypes[offset]
    // const targetScopes = this.getsScopeHandlers().map((scopeHandler) =>
    //   scopeHandler.getScopeRelativeToPosition(
    //     editor,
    //     position,
    //     offset,
    //     direction
    //   )
    // )
  }

  private getsScopeHandlers(): ScopeHandler[] {
    return this.scopeType.scopeTypes.map((scopeType) => {
      const handler = getScopeHandler(scopeType, this.languageId);
      if (handler == null) {
        throw new Error(`No available scope handler for '${scopeType.type}'`);
      }
      return handler;
    });
  }
}

function scopeComparator(a: Scope, b: Scope): number {
  if (a.domain.contains(b.domain)) {
    return 1;
  }
  if (b.domain.contains(a.domain)) {
    return -1;
  }
  return 0;
}
