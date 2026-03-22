import type { Direction, Position, TextEditor } from "@cursorless/lib-common";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { advanceIteratorsUntil, getInitialIteratorInfos } from "./IteratorInfo";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { compareTargetScopes } from "./compareTargetScopes";
import type { TargetScope } from "./scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
  SortedScopeType,
} from "./scopeHandler.types";

export class SortedScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;
  public scopeType = undefined;
  private iterationScopeHandler: SortedScopeHandler | undefined;
  private lastYieldedIndex: number | undefined;

  static maybeCreate(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: SortedScopeType,
    languageId: string,
  ): ScopeHandler | undefined {
    const scopeHandlers = scopeType.scopeTypes
      .map((scopeType) =>
        scopeHandlerFactory.maybeCreate(scopeType, languageId),
      )
      .filter(
        (scopeHandler): scopeHandler is ScopeHandler => scopeHandler != null,
      );

    if (scopeHandlers.length === 0) {
      return undefined;
    }

    if (scopeHandlers.length === 1) {
      return scopeHandlers[0];
    }

    return new SortedScopeHandler(
      scopeHandlerFactory,
      languageId,
      scopeHandlers,
    );
  }

  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private languageId: string,
    private scopeHandlers: ScopeHandler[],
  ) {
    super();
  }

  get iterationScopeType(): CustomScopeType {
    if (this.iterationScopeHandler == null) {
      const iterationScopeHandlers = this.scopeHandlers.map((s) =>
        this.scopeHandlerFactory.create(s.iterationScopeType, this.languageId),
      );
      this.iterationScopeHandler = new SortedScopeHandler(
        this.scopeHandlerFactory,
        this.languageId,
        iterationScopeHandlers,
      );
    }
    return {
      type: "custom",
      scopeHandler: this.iterationScopeHandler,
    };
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    // If we have used an iteration scope handler, we only want to yield additional scopes from its handler.
    if (this.iterationScopeHandler?.lastYieldedIndex != null) {
      const handlerIndex = this.iterationScopeHandler.lastYieldedIndex;
      const handler = this.scopeHandlers[handlerIndex];
      yield* handler.generateScopes(editor, position, direction, hints);
      return;
    }

    const iterators = this.scopeHandlers.map((scopeHandler) =>
      scopeHandler
        .generateScopes(editor, position, direction, hints)
        [Symbol.iterator](),
    );

    let iteratorInfos = getInitialIteratorInfos(iterators);

    while (iteratorInfos.length > 0) {
      iteratorInfos.sort((a, b) =>
        compareTargetScopes(direction, position, a.value, b.value),
      );

      // Pick minimum scope according to canonical scope ordering
      const iteratorInfo = iteratorInfos[0];
      const currentScope = iteratorInfo.value;
      this.lastYieldedIndex = iteratorInfo.index;

      yield currentScope;

      // Advance all iterators past the scope that was yielded
      iteratorInfos = advanceIteratorsUntil(
        iteratorInfos,
        (scope) =>
          compareTargetScopes(direction, position, currentScope, scope) < 0,
      );
    }
  }
}
