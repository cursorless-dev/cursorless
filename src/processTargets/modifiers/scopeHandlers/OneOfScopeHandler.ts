import { Position, TextEditor } from "vscode";
import { getScopeHandler } from ".";
import {
  Direction,
  OneOfScopeType,
} from "../../../typings/targetDescriptor.types";
import { compareTargetScopes } from "./compareTargetScopes";
import {
  getInitialIteratorInfos,
  advanceIteratorsUntil,
} from "./getInitialIteratorInfos";
import type { TargetScope } from "./scope.types";
import { ScopeHandler, ScopeIteratorHints } from "./scopeHandler.types";

export default class OneOfScopeHandler implements ScopeHandler {
  private scopeHandlers: ScopeHandler[] = this.scopeType.scopeTypes.map(
    (scopeType) => {
      const handler = getScopeHandler(scopeType, this.languageId);
      if (handler == null) {
        throw new Error(`No available scope handler for '${scopeType.type}'`);
      }
      return handler;
    },
  );

  public iterationScopeType: OneOfScopeType = {
    type: "oneOf",
    scopeTypes: this.scopeHandlers.map(
      ({ iterationScopeType }) => iterationScopeType,
    ),
  };

  constructor(
    public readonly scopeType: OneOfScopeType,
    private languageId: string,
  ) {}

  *generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorHints | undefined,
  ): Iterable<TargetScope> {
    const iterators = this.scopeHandlers.map((scopeHandler) =>
      scopeHandler
        .generateScopesRelativeToPosition(editor, position, direction, hints)
        [Symbol.iterator](),
    );

    let currentPosition = position;
    let iteratorInfos = getInitialIteratorInfos(iterators);

    while (iteratorInfos.length > 0) {
      iteratorInfos.sort((a, b) =>
        compareTargetScopes(direction, position, a.value, b.value),
      );

      const nextScope = iteratorInfos[0].value;
      yield nextScope;

      currentPosition =
        direction === "forward" ? nextScope.domain.end : nextScope.domain.start;

      iteratorInfos = advanceIteratorsUntil(iteratorInfos, ({ domain }) =>
        direction === "forward"
          ? domain.end.isAfterOrEqual(currentPosition)
          : domain.start.isBeforeOrEqual(currentPosition),
      );
    }
  }
}
