import { TextEditor, Position, Range } from "vscode";
import { NoContainingScopeError } from "../../../errors";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getPreferredScope } from "../getPreferredScope";
import {
  IterationScope,
  ScopeHandler,
  TargetScope,
} from "./scopeHandler.types";

export default abstract class NestedScopeHandler implements ScopeHandler {
  constructor(private parentScopeHandler: ScopeHandler) {}

  abstract get scopeType(): ScopeType;

  protected abstract getScopesInParentScope(
    parentScope: TargetScope
  ): TargetScope[];

  getScopesIntersectingPosition(
    editor: TextEditor,
    position: Position
  ): TargetScope[] {
    const parentScope = getPreferredScope(
      this.parentScopeHandler.getScopesIntersectingPosition(editor, position)
    );

    if (parentScope == null) {
      return [];
    }

    return this.getScopesInParentScope(parentScope).filter(({ domain }) =>
      domain.contains(position)
    );
  }

  getScopesIntersectingRange(editor: TextEditor, range: Range): TargetScope[] {
    return this.parentScopeHandler
      .getScopesIntersectingRange(editor, range)
      .flatMap((parentScope) => this.getScopesInParentScope(parentScope))
      .filter(({ domain }) => {
        const intersection = domain.intersection(range);
        return intersection != null && !intersection.isEmpty;
      });
  }

  getIterationScopesIntersectingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[] {
    return this.parentScopeHandler
      .getScopesIntersectingPosition(editor, position)
      .map((parentScope) => ({
        domain: parentScope.domain,
        editor,
        isPreferredOver: parentScope.isPreferredOver,
        scopes: this.getScopesInParentScope(parentScope),
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

    throw new NoContainingScopeError(this.scopeType.type);
  }

  private *iterateScopeGroups(
    editor: TextEditor,
    position: Position,
    direction: Direction
  ): Generator<TargetScope[], void, unknown> {
    const containingParentScope = getPreferredScope(
      this.parentScopeHandler.getScopesIntersectingPosition(editor, position)
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
