import type { Direction, ScopeType } from "@cursorless/common";
import { Position, TextEditor } from "@cursorless/common";
import { flatmap } from "itertools";
import BaseScopeHandler from "./BaseScopeHandler";
import { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";

/**
 * This class can be used to define scope types that are most easily defined by
 * simply getting all scopes in an instance of a parent scope type and then
 * operating on those.  A good example is regex-based scope types where the
 * regex can't cross line boundaries.  In this case the
 * {@link iterationScopeType} will be `line`, and we just return a list of all
 * regex matches to this base class and let it handle the rest.
 *
 * Note that this base class only works for non-hierarchical scope types.  In
 * the future we may define a nested scope handler that supports hierarchical
 * scope types.
 */
export default abstract class NestedScopeHandler extends BaseScopeHandler {
  public abstract readonly iterationScopeType: ScopeType;
  protected readonly isHierarchical = false;

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
   * type.  It should yield all child scope types in the given parent scope
   * type, in the order specified in {@link direction}.
   * @param searchScope An instance of the parent scope type from which to
   * return all child target scopes
   */
  protected abstract generateScopesInSearchScope(
    direction: Direction,
    searchScope: TargetScope,
  ): Iterable<TargetScope>;

  private _searchScopeHandler: ScopeHandler | undefined;

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    public readonly scopeType: ScopeType,
    protected languageId: string,
  ) {
    super();
  }

  private get searchScopeHandler(): ScopeHandler {
    if (this._searchScopeHandler == null) {
      this._searchScopeHandler = this.scopeHandlerFactory.create(
        this.searchScopeType,
        this.languageId,
      )!;
    }

    return this._searchScopeHandler;
  }

  protected generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const { containment, ...rest } = hints;
    const generator = this.searchScopeHandler.generateScopes(
      editor,
      position,
      direction,
      // If containment is disallowed, we need to unset that for the search
      // scope, because the search scope could contain position but nested
      // scopes do not.
      {
        containment: containment === "required" ? "required" : undefined,
        ...rest,
      },
    );

    return flatmap(generator, (searchScope) =>
      this.generateScopesInSearchScope(direction, searchScope),
    );
  }
}
