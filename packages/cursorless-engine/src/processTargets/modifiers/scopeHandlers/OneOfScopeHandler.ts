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

export class OneOfScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;
  private iterationScopeHandler: OneOfScopeHandler | undefined;
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
      scopeType,
      scopeHandlers,
      languageId,
    );
  }

  static createFromScopeHandlers(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: OneOfScopeType,
    scopeHandlers: ScopeHandler[],
    languageId: string,
  ): ScopeHandler {
    const getIterationScopeHandler = () =>
      new OneOfScopeHandler(
        undefined,
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

    return new OneOfScopeHandler(
      scopeType,
      scopeHandlers,
      getIterationScopeHandler,
    );
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

  private constructor(
    public readonly scopeType: OneOfScopeType | undefined,
    private scopeHandlers: ScopeHandler[],
    private getIterationScopeHandler: () => OneOfScopeHandler,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    // If we have used the iteration scope handler we only want to yield from it's handler
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
