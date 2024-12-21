import {
  NoContainingScopeError,
  type Direction,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import type { TargetScope } from "./scope.types";
import type {
  FallbackScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";

export class FallbackScopeHandler extends BaseScopeHandler {
  public scopeType = undefined;
  protected isHierarchical = true;

  get iterationScopeType(): ScopeType {
    throw new NoContainingScopeError(
      "Iteration scope for FallbackScopeHandler",
    );
  }

  constructor(
    public scopeHandlerFactory: ScopeHandlerFactory,
    private fallbackScopeType: FallbackScopeType,
    private languageId: string,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const scopeHandlers: ScopeHandler[] = this.fallbackScopeType.scopeTypes.map(
      (scopeType) =>
        this.scopeHandlerFactory.create(scopeType, this.languageId),
    );

    for (const scopeHandler of scopeHandlers) {
      yield* scopeHandler.generateScopes(editor, position, direction, hints);
    }
  }
}
