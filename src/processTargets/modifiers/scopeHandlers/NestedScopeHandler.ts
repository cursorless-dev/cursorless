import type { Position, Range, TextEditor } from "vscode";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import { getPreferredScope } from "../getPreferredScope";
import { OutOfRangeError } from "../targetSequenceUtils";
import { getScopeHandler } from ".";
import type { IterationScope, TargetScope } from "./scope.types";
import type { ScopeHandler } from "./scopeHandler.types";

export default abstract class NestedScopeHandler implements ScopeHandler {
  private iterationScopeHandler: ScopeHandler;

  constructor(
    public readonly iterationScopeType: ScopeType,
    languageId: string
  ) {
    this.iterationScopeHandler = getScopeHandler(
      iterationScopeType,
      languageId
    )!;
  }

  abstract get scopeType(): ScopeType;

  protected abstract getScopesInIterationScope(
    iterationScope: TargetScope
  ): TargetScope[];

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): TargetScope[] {
    const iterationScope = getPreferredScope(
      this.iterationScopeHandler.getScopesTouchingPosition(editor, position)
    );

    if (iterationScope == null) {
      return [];
    }

    return this.getScopesInIterationScope(iterationScope).filter(({ domain }) =>
      domain.contains(position)
    );
  }

  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    return this.iterationScopeHandler
      .getScopesOverlappingRange(editor, range)
      .flatMap((iterationScope) =>
        this.getScopesInIterationScope(iterationScope)
      )
      .filter(({ domain }) => {
        const intersection = domain.intersection(range);
        return intersection != null && !intersection.isEmpty;
      });
  }

  getIterationScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[] {
    return this.iterationScopeHandler
      .getScopesTouchingPosition(editor, position)
      .map((iterationScope) => ({
        domain: iterationScope.domain,
        editor,
        isPreferredOver: iterationScope.isPreferredOver,
        getScopes: () => this.getScopesInIterationScope(iterationScope),
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
    const containingIterationScope = getPreferredScope(
      this.iterationScopeHandler.getScopesTouchingPosition(editor, position)
    );

    let currentPosition = position;

    if (containingIterationScope != null) {
      yield this.getScopesInIterationScope(containingIterationScope).filter(
        ({ domain }) =>
          direction === "forward"
            ? domain.start.isAfterOrEqual(position)
            : domain.end.isBeforeOrEqual(position)
      );

      currentPosition =
        direction === "forward"
          ? containingIterationScope.domain.end
          : containingIterationScope.domain.start;
    }

    while (true) {
      const iterationScope =
        this.iterationScopeHandler.getScopeRelativeToPosition(
          editor,
          currentPosition,
          1,
          direction
        );

      yield this.getScopesInIterationScope(iterationScope);

      currentPosition =
        direction === "forward"
          ? iterationScope.domain.end
          : iterationScope.domain.start;
    }
  }
}
