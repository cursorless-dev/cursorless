// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type { Direction, ScopeType } from "@cursorless/common";
import { Position, TextEditor } from "@cursorless/common";
import type { TargetScope } from "./scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import { shouldYieldScope } from "./shouldYieldScope";

const DEFAULT_REQUIREMENTS: ScopeIteratorRequirements = {
  containment: null,
  distalPosition: null,
};

/**
 * All scope handlers should derive from this base class
 */
export default abstract class BaseScopeHandler implements ScopeHandler {
  public abstract readonly scopeType: ScopeType | undefined;
  public abstract readonly iterationScopeType: ScopeType | CustomScopeType;

  /**
   * Indicates whether scopes are allowed to contain one another.  If `false`, we
   * can optimise the algorithm by making certain assumptions.
   */
  protected abstract readonly isHierarchical: boolean;

  /**
   * Returns an iterable that yields scopes.
   *
   * If your scope type is *not* hierarchical, and {@link direction} is
   * `"forward"`, yield all scopes whose {@link TargetScope.domain|domain}'s
   * {@link Range.end|end} is equal to or after {@link position} in document
   * order.
   *
   * If your scope type is *not* hierarchical, and {@link direction} is
   * `"backward"`, yield all scopes whose {@link TargetScope.domain|domain}'s
   * {@link Range.start|start} is equal to or before {@link position}, in
   * reverse document order.
   *
   * If your scope type *is* hierarchical, and {@link direction} is `"forward"`,
   * walk forward starting at {@link position} (including position). Any time a
   * scope's {@link TargetScope.domain|domain} ends or starts, yield that scope.
   * If multiple domains start or end at a particular point, break ties as
   * follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are ending, in reverse order of
   *    where they start.
   * 3. Then yield the scope with minimal domain that is starting. Any time you
   *    yield a scope, advance your position to the end of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * If your scope type *is* hierarchical, and {@link direction} is
   * `"backward"`, walk backward starting at {@link position} (including
   * position). Any time a scope's {@link TargetScope.domain|domain} ends or
   * starts, yield that scope. If multiple domains start or end at a particular
   * point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are starting, in order of where they
   *    end.
   * 3. Then yield the scope with minimal domain that is ending. Any time you
   *    yield a scope, advance your position to the start of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * Note that the {@link hints} argument can be ignored, but you are welcome to
   * use it to improve performance.  For example, knowing the
   * {@link ScopeIteratorRequirements.distalPosition} can be useful if you need
   * to query a list of scopes in bulk.
   *
   * Some notes:
   *
   * - Once you have yielded a scope, you do not need to yield any scopes
   *   contained by that scope.
   * - You can yield the same scope more than once if it makes your life easier
   *
   * The only strict requirements are that
   *
   * - you yield every scope that might meet the requirements
   * - you yield scopes in the correct order
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
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope>;

  *generateScopes(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    requirements: Partial<ScopeIteratorRequirements> = {},
  ): Iterable<TargetScope> {
    let previousScope: TargetScope | undefined = undefined;
    const hints: ScopeIteratorRequirements = {
      ...DEFAULT_REQUIREMENTS,
      ...requirements,
    };

    for (const scope of this.generateScopeCandidates(
      editor,
      position,
      direction,
      hints,
    )) {
      if (shouldYieldScope(position, direction, hints, previousScope, scope)) {
        yield scope;
        previousScope = scope;
      }

      if (this.canStopEarly(position, direction, hints, scope)) {
        return;
      }
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
      // Don't try anything fancy if scope is hierarchical
      return false;
    }

    if (
      containment === "required" &&
      (direction === "forward"
        ? domain.end.isAfter(position)
        : domain.start.isBefore(position))
    ) {
      // If we require containment, then if we have already yielded something
      // ending strictly after position, we won't yield anything else containing
      // position
      return true;
    }

    if (
      distalPosition != null &&
      (direction === "forward"
        ? domain.end.isAfterOrEqual(distalPosition)
        : domain.start.isBeforeOrEqual(distalPosition))
    ) {
      // If we have a distal position, and we have yielded something that ends
      // at or after distal position, we won't be able to yield anything else
      // that starts before distal position
      return true;
    }

    return false;
  }
}
