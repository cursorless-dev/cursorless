import type { Position, Range, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import { getLeftScope, getRightScope } from "../getPreferredScope";
import { OutOfRangeError } from "../targetSequenceUtils";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import type { IterationScope, TargetScope } from "./scope.types";
import type { ScopeHandler } from "./scopeHandler.types";

/**
 * This class can be used to define scope types that are most easily defined by
 * simply getting all scopes in an instance of a parent scope type and then
 * operating on those.  A good example is regex-based scope types where the
 * regex can't cross line boundaries.  In this case the
 * {@link iterationScopeType} will be `line`, and we just return a list of all
 * regex matches to this base class and let it handle the rest.
 */
export default abstract class NestedScopeHandler implements ScopeHandler {
  public abstract readonly scopeType: ScopeType;
  public abstract readonly iterationScopeType: ScopeType;

  /**
   * This function is the only function that needs to be defined in the derived
   * type.  It should just return a list of all child scope types in the given
   * parent scope type.
   * @param iterationScope An instance of the parent scope type from which to
   * return all child target scopes
   * @returns A list of all child scope types in the given parent scope type
   */
  protected abstract getScopesInIterationScope(
    iterationScope: TargetScope
  ): TargetScope[];

  private _iterationScopeHandler: ScopeHandler | undefined;

  constructor(private languageId: string) {}

  private get iterationScopeHandler(): ScopeHandler {
    if (this._iterationScopeHandler == null) {
      this._iterationScopeHandler = getScopeHandler(
        this.iterationScopeType,
        this.languageId
      )!;
    }

    return this._iterationScopeHandler;
  }

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number = 0
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return this.iterationScopeHandler
      .getScopesTouchingPosition(editor, position)
      .flatMap((iterationScope) =>
        this.getScopesInIterationScope(iterationScope)
      )
      .filter(({ domain }) => domain.contains(position));
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

    // Note that most of the heavy lifting is done by iterateScopeGroups; here
    // we just repeatedly subtract `scopes.length` until we have seen as many
    // scopes as required by `offset`.
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

  /**
   * Yields groups of scopes for use in {@link getScopeRelativeToPosition}.
   * Begins by returning a list of all scopes in the iteration scope containing
   * {@link position} that are after {@link position} (before if
   * {@link direction} is `"backward"`).
   *
   * Then repeatedly calls {@link getScopeRelativeToPosition} on the parent
   * scope and returns all child scopes in each returned parent scope.
   *
   * @param editor The editor containing {@link position}
   * @param position The position passed in to
   * {@link getScopeRelativeToPosition}
   * @param direction The direction passed in to
   * {@link getScopeRelativeToPosition}
   */
  private *iterateScopeGroups(
    editor: TextEditor,
    position: Position,
    direction: Direction
  ): Generator<TargetScope[], void, unknown> {
    const containingIterationScopes =
      this.iterationScopeHandler.getScopesTouchingPosition(editor, position);

    const containingIterationScope =
      direction === "forward"
        ? getRightScope(containingIterationScopes)
        : getLeftScope(containingIterationScopes);

    let currentPosition = position;

    if (containingIterationScope != null) {
      yield this.getScopesInIterationScope(containingIterationScope).filter(
        ({ domain }) =>
          direction === "forward"
            ? domain.start.isAfterOrEqual(position)
            : domain.end.isBeforeOrEqual(position)
      );

      // Move current position past containing scope so that asking for next
      // parent iteration scope won't just give us back the same on
      currentPosition =
        direction === "forward"
          ? containingIterationScope.domain.end
          : containingIterationScope.domain.start;
    }

    while (true) {
      // Note that we always use an `offset` of 1 here.  We could instead have
      // left `currentPosition` unchanged and incremented offset, but in some
      // cases it will be more efficient not to ask parent to walk past the same
      // scopes over and over again.  Eg for surrounding pair this can help us.
      // For line it makes no difference.
      const iterationScope =
        this.iterationScopeHandler.getScopeRelativeToPosition(
          editor,
          currentPosition,
          1,
          direction
        );

      yield this.getScopesInIterationScope(iterationScope);

      // Move current position past the scope we just used so that asking for next
      // parent iteration scope won't just give us back the same on
      currentPosition =
        direction === "forward"
          ? iterationScope.domain.end
          : iterationScope.domain.start;
    }
  }
}
