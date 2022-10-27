import type { Position, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import type { TargetScope } from "./scope.types";
import type { ScopeHandler, ScopeIteratorHints } from "./scopeHandler.types";
import { shouldReturnScope } from "./scopeHandlers.helpers";

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
  *generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorHints | undefined = {},
  ): Iterable<TargetScope> {
    const { containment, ...rest } = hints;
    const iterator = this.searchScopeHandler
      .generateScopesRelativeToPosition(editor, position, direction, {
        containment: containment === "required" ? "required" : undefined,
        ...rest,
      })
      [Symbol.iterator]();

    let { value: searchScope, done } = iterator.next();

    if (done) {
      return;
    }

    yield* maybeReverse(
      this.getScopesInSearchScope(searchScope).filter(
        (scope) =>
          (direction === "forward"
            ? scope.domain.end.isAfter(position)
            : scope.domain.start.isBefore(position)) &&
          shouldReturnScope(position, hints, scope),
      ),
      direction === "backward",
    );

    while (true) {
      ({ value: searchScope, done } = iterator.next());

      if (done) {
        return;
      }

      yield* maybeReverse(
        this.getScopesInSearchScope(searchScope).filter((scope) =>
          shouldReturnScope(position, hints, scope),
        ),
        direction === "backward",
      );
    }
  }
}

function maybeReverse<T>(original: T[], doReverse: boolean): Iterable<T> {
  return doReverse ? [...original].reverse() : original;
}
