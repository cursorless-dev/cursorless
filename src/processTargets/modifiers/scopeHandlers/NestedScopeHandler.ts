import { TextEditor, Position, Range } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getPreferredScope } from "../getPreferredScope";
import { ScopeHandler } from "./scopeHandler.types";
import { IterationScope, TargetScope } from "./scope.types";
import { OutOfRangeError } from "../targetSequenceUtils";

export default abstract class NestedScopeHandler implements ScopeHandler {
  constructor(private parentScopeHandler: ScopeHandler) {}

  abstract get scopeType(): ScopeType;

  protected abstract getScopesInParentScope(
    parentScope: TargetScope
  ): TargetScope[];

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): TargetScope[] {
    const parentScope = getPreferredScope(
      this.parentScopeHandler.getScopesTouchingPosition(editor, position)
    );

    if (parentScope == null) {
      return [];
    }

    return this.getScopesInParentScope(parentScope).filter(({ domain }) =>
      domain.contains(position)
    );
  }

  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    return this.parentScopeHandler
      .getScopesOverlappingRange(editor, range)
      .flatMap((parentScope) => this.getScopesInParentScope(parentScope))
      .filter(({ domain }) => {
        const intersection = domain.intersection(range);
        return intersection != null && !intersection.isEmpty;
      });
  }

  getIterationScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[] {
    return this.parentScopeHandler
      .getScopesTouchingPosition(editor, position)
      .map((parentScope) => ({
        domain: parentScope.domain,
        editor,
        isPreferredOver: parentScope.isPreferredOver,
        getScopes: () => this.getScopesInParentScope(parentScope),
      }));
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): TargetScope {
    let remainingOffset = offset;

    const iterator = this.iterateScopeGroups(editor, position, direction);
    for (const scopes of iterator) {
      if (scopes.length >= remainingOffset) {
        return direction === "forward"
          ? scopes.at(remainingOffset - 1)!
          : scopes.at(-remainingOffset)!;
      }

      remainingOffset -= scopes.length;
    }

    throw new OutOfRangeError();
  }

  private *iterateScopeGroups(
    editor: TextEditor,
    position: Position,
    direction: Direction
  ): Generator<TargetScope[], void, unknown> {
    const containingParentScope = getPreferredScope(
      this.parentScopeHandler.getScopesTouchingPosition(editor, position)
    );

    let currentPosition = position;

    if (containingParentScope != null) {
      yield this.getScopesInParentScope(containingParentScope).filter(
        ({ domain }) =>
          direction === "forward"
            ? domain.start.isAfterOrEqual(position)
            : domain.end.isBeforeOrEqual(position)
      );

      currentPosition =
        direction === "forward"
          ? containingParentScope.domain.end
          : containingParentScope.domain.start;
    }

    while (true) {
      const parentScope = this.parentScopeHandler.getScopeRelativeToPosition(
        editor,
        currentPosition,
        1,
        direction
      );

      yield this.getScopesInParentScope(parentScope);

      currentPosition =
        direction === "forward"
          ? parentScope.domain.end
          : parentScope.domain.start;
    }
  }
}
