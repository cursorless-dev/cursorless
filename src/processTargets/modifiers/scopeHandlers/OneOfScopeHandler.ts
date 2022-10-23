import { minBy } from "lodash";
import { Position, Range, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import {
  Direction,
  OneOfScopeType,
} from "../../../typings/targetDescriptor.types";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import type { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class OneOfScopeHandler implements ScopeHandler {
  private scopeHandlers: ScopeHandler[] = this.scopeType.scopeTypes.map(
    (scopeType) => {
      const handler = getScopeHandler(scopeType, this.languageId);
      if (handler == null) {
        throw new Error(`No available scope handler for '${scopeType.type}'`);
      }
      return handler;
    }
  );

  public iterationScopeType: OneOfScopeType = {
    type: "oneOf",
    scopeTypes: this.scopeHandlers.map(
      ({ iterationScopeType }) => iterationScopeType
    ),
  };

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
    if (ancestorIndex !== 0) {
      // FIXME: Maybe we could find a way to support this opne in the future.
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return keepOnlyTopLevelScopes(
      this.scopeHandlers.flatMap((scopeHandler) =>
        scopeHandler.getScopesTouchingPosition(editor, position, ancestorIndex)
      )
    );
  }

  /** Return all scopes overlapping range not contained by another scope */
  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    return keepOnlyTopLevelScopes(
      this.scopeHandlers.flatMap((scopeHandler) =>
        scopeHandler.getScopesOverlappingRange(editor, range)
      )
    );
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): TargetScope {
    let currentPosition = position;
    let currentScope: TargetScope;

    for (let i = 0; i < offset; i++) {
      const candidateScopes = this.scopeHandlers.map((scopeHandler) =>
        scopeHandler.getScopeRelativeToPosition(
          editor,
          currentPosition,
          1,
          direction
        )
      );

      currentScope = minBy(candidateScopes, (scope) =>
        direction === "forward" ? scope.domain.start : -scope.domain.start
      )!;

      currentPosition =
        direction === "forward"
          ? currentScope.domain.end
          : currentScope.domain.start;
    }

    return currentScope!;
  }
}

function keepOnlyTopLevelScopes(candidateScopes: TargetScope[]): TargetScope[] {
  return candidateScopes.filter(
    ({ domain }) =>
      !candidateScopes.some(({ domain: otherDomain }) =>
        otherDomain.contains(domain)
      )
  );
}
