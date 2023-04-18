import {
  Direction,
  OneOfScopeType,
  Position,
  TextEditor,
} from "@cursorless/common";
import BaseScopeHandler from "./BaseScopeHandler";
import { advanceIteratorsUntil, getInitialIteratorInfos } from "./IteratorInfo";
import { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { compareTargetScopes } from "./compareTargetScopes";
import type { TargetScope } from "./scope.types";
import {
  CustomScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";

export default class OneOfScopeHandler extends BaseScopeHandler {
  protected isHierarchical = true;

  static create(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: OneOfScopeType,
    languageId: string,
  ): ScopeHandler {
    const scopeHandlers: ScopeHandler[] = scopeType.scopeTypes.map(
      (scopeType) => {
        const handler = scopeHandlerFactory.create(scopeType, languageId);
        if (handler == null) {
          throw new Error(`No available scope handler for '${scopeType.type}'`);
        }
        return handler;
      },
    );

    const iterationScopeType = (): CustomScopeType => ({
      type: "custom",
      scopeHandler: new OneOfScopeHandler(
        undefined,
        scopeHandlers.map(
          (scopeHandler) =>
            scopeHandlerFactory.create(
              scopeHandler.iterationScopeType,
              languageId,
            )!,
        ),
        () => {
          throw new Error("Not implemented");
        },
      ),
    });

    return new OneOfScopeHandler(scopeType, scopeHandlers, iterationScopeType);
  }

  get iterationScopeType(): CustomScopeType {
    return this.getIterationScopeType();
  }

  private constructor(
    public readonly scopeType: OneOfScopeType | undefined,
    private scopeHandlers: ScopeHandler[],
    private getIterationScopeType: () => CustomScopeType,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
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
      const currentScope = iteratorInfos[0].value;

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
