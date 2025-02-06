import type {
  Direction,
  OneOfScopeType,
  Position,
  TextEditor,
} from "@cursorless/common";
import { BaseScopeHandler } from "./BaseScopeHandler";
import { advanceIteratorsUntil, getInitialIteratorInfos } from "./IteratorInfo";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { compareTargetScopes } from "./compareTargetScopes";
import type { TargetScope } from "./scope.types";
import type {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";

export class PreferredScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;
  public scopeType = undefined;
  private iterationScopeHandler: PreferredScopeHandler | undefined;
  private lastYieldedIndex: number | undefined;

  static create(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: OneOfScopeType,
    languageId: string,
  ): ScopeHandler {
    const scopeHandlers: ScopeHandler[] = scopeType.scopeTypes.map(
      (scopeType) => scopeHandlerFactory.create(scopeType, languageId),
    );

    return this.createFromScopeHandlers(
      scopeHandlerFactory,
      languageId,
      scopeHandlers,
    );
  }

  static createFromScopeHandlers(
    scopeHandlerFactory: ScopeHandlerFactory,
    languageId: string,
    scopeHandlers: ScopeHandler[],
  ): ScopeHandler {
    const getIterationScopeHandler = () =>
      new PreferredScopeHandler(
        scopeHandlers.map((scopeHandler) =>
          scopeHandlerFactory.create(
            scopeHandler.iterationScopeType,
            languageId,
          ),
        ),
        () => {
          throw new Error("Not implemented");
        },
      );

    return new PreferredScopeHandler(scopeHandlers, getIterationScopeHandler);
  }

  private constructor(
    private scopeHandlers: ScopeHandler[],
    private getIterationScopeHandler: () => PreferredScopeHandler,
  ) {
    super();
  }

  get iterationScopeType(): CustomScopeType {
    if (this.iterationScopeHandler == null) {
      this.iterationScopeHandler = this.getIterationScopeHandler();
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
