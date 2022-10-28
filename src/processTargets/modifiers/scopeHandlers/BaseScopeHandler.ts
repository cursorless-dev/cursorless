import type { Position, TextEditor } from "vscode";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import { shouldReturnScope } from "./scopeHandlers.helpers";

/**
 * All scope handlers should derive from this base class
 */
export default abstract class BaseScopeHandler implements ScopeHandler {
  public abstract readonly scopeType: ScopeType;
  public abstract readonly iterationScopeType: ScopeType;

  protected abstract readonly isHierarchical: boolean;

  /**
   * Returns an iterable that yields scopes.
   *
   * If {@link direction} is `"forward"`, walk forward starting at
   * {@link position} (including position). Any time a scope's
   * {@link TargetScope.domain|domain} ends or starts, yield that scope.  If
   * multiple domains start or end at a particular point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are ending, in reverse order of
   *    where they start.
   * 3. Then yield the scope with minimal domain that is starting. Any time you
   *    yield a scope, advance your position to the end of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * Note that once you have yielded a scope, you should not yield any scopes
   * contained by that scope.
   *
   * In the case of a non-hierarchical scope type, the above is equivalent to
   * the following:
   *
   * Yield all scopes whose {@link TargetScope.domain|domain}'s
   * {@link Range.end|end} is equal to or after {@link position}, in order of
   * domain end position.
   *
   * If {@link direction} is `"backward"`, walk backward starting at
   * {@link position} (including position). Any time a scope's
   * {@link TargetScope.domain|domain} ends or starts, yield that scope.  If
   * multiple domains start or end at a particular point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are starting, in order of where they
   *    end.
   * 3. Then yield the scope with minimal domain that is ending. Any time you
   *    yield a scope, advance your position to the start of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * In the case of a non-hierarchical scope type, the above is equivalent to
   * the following:
   *
   * Yield all scopes whose {@link TargetScope.domain|domain}'s
   * {@link Range.start|start} is equal to or before {@link position}, in
   * reverse order domain start position.
   *
   * Note that the {@link hints} argument can be ignored, but you may find
   * dramatic performance improvements by respecting the hints, especially if
   * the hints allow you to stop early.  For example, if
   * {@link ScopeIteratorRequirements.containment} is `"required"`, and your
   * scope type is not hierarchical, then you can stop once you get to the first
   * scope that doesn't contain {@link position}.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param direction The direction to go relative to {@link position}
   * @param hints Optional hints about which scopes should be returned
   */
  protected abstract generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorRequirements | undefined,
  ): Iterable<TargetScope>;

  *generateScopes(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    requirements: ScopeIteratorRequirements | undefined = {},
  ): Iterable<TargetScope> {
    let previousScope: TargetScope | undefined = undefined;

    for (const scope of this.generateScopeCandidates(
      editor,
      position,
      direction,
      requirements,
    )) {
      if (
        shouldReturnScope(
          position,
          direction,
          requirements,
          previousScope,
          scope,
        )
      ) {
        yield scope;
      }

      if (this.canStopEarly(position, direction, requirements, scope)) {
        return;
      }

      previousScope = scope;
    }
  }

  private canStopEarly(
    position: Position,
    direction: Direction,
    requirements: ScopeIteratorRequirements,
    { domain }: TargetScope,
  ) {
    const { containment, distalPosition } = requirements;

    if (this.isHierarchical) {
      return false;
    }

    if (
      containment === "required" &&
      (direction === "forward"
        ? domain.end.isAfter(position)
        : domain.start.isBefore(position))
    ) {
      return true;
    }

    if (
      distalPosition != null &&
      (direction === "forward"
        ? domain.end.isAfterOrEqual(distalPosition)
        : domain.start.isBeforeOrEqual(distalPosition))
    ) {
      return true;
    }

    return false;
  }
}
