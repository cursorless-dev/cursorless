import type { Position, Range, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import { getLeftScope, getRightScope } from "../getPreferredScope";
import { OutOfRangeError } from "../targetSequenceUtils";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import type { TargetScope } from "./scope.types";
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
  public abstract readonly iterationScopeType: ScopeType;

  /**
   * We expand to this scope type before looking for instances of the scope type
   * handled by this scope handler.  In most cases the iteration scope will
   * suffice, but in some cases you want them to diverge.  For example, you
   * might want the default iteration scope to be `"file"`, but you don't need
   * to expand to the file just to find instances of the given scope type.
   */
  protected get searchScopeType(): ScopeType {
    return this.iterationScopeType;
  }

  /**
   * This function is the only function that needs to be defined in the derived
   * type.  It should just return a list of all child scope types in the given
   * parent scope type.
   * @param searchScope An instance of the parent scope type from which to
   * return all child target scopes
   * @returns A list of all child scope types in the given parent scope type
   */
  protected abstract getScopesInSearchScope(
    searchScope: TargetScope,
  ): TargetScope[];

  private _searchScopeHandler: ScopeHandler | undefined;

  constructor(
    public readonly scopeType: ScopeType,
    protected languageId: string,
  ) {}

  private get searchScopeHandler(): ScopeHandler {
    if (this._searchScopeHandler == null) {
      this._searchScopeHandler = getScopeHandler(
        this.searchScopeType,
        this.languageId,
      )!;
    }

    return this._searchScopeHandler;
  }

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number = 0,
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return this.searchScopeHandler
      .getScopesTouchingPosition(editor, position)
      .flatMap((searchScope) => this.getScopesInSearchScope(searchScope))
      .filter(({ domain }) => domain.contains(position));
  }

  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    return this.searchScopeHandler
      .getScopesOverlappingRange(editor, range)
      .flatMap((searchScope) => this.getScopesInSearchScope(searchScope))
      .filter(({ domain }) => {
        const intersection = domain.intersection(range);
        return intersection != null && !intersection.isEmpty;
      });
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction,
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
   * Begins by returning a list of all scopes in the search scope containing
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
    direction: Direction,
  ): Generator<TargetScope[], void, unknown> {
    const containingSearchScopes =
      this.searchScopeHandler.getScopesTouchingPosition(editor, position);

    const containingSearchScope =
      direction === "forward"
        ? getRightScope(containingSearchScopes)
        : getLeftScope(containingSearchScopes);

    let currentPosition = position;

    if (containingSearchScope != null) {
      yield this.getScopesInSearchScope(containingSearchScope).filter(
        ({ domain }) =>
          direction === "forward"
            ? domain.start.isAfterOrEqual(position)
            : domain.end.isBeforeOrEqual(position),
      );

      // Move current position past containing scope so that asking for next
      // parent search scope won't just give us back the same on
      currentPosition =
        direction === "forward"
          ? containingSearchScope.domain.end
          : containingSearchScope.domain.start;
    }

    while (true) {
      // Note that we always use an `offset` of 1 here.  We could instead have
      // left `currentPosition` unchanged and incremented offset, but in some
      // cases it will be more efficient not to ask parent to walk past the same
      // scopes over and over again.  Eg for surrounding pair this can help us.
      // For line it makes no difference.
      const searchScope = this.searchScopeHandler.getScopeRelativeToPosition(
        editor,
        currentPosition,
        1,
        direction,
      );

      yield this.getScopesInSearchScope(searchScope);

      // Move current position past the scope we just used so that asking for next
      // parent search scope won't just give us back the same on
      currentPosition =
        direction === "forward"
          ? searchScope.domain.end
          : searchScope.domain.start;
    }
  }
}
