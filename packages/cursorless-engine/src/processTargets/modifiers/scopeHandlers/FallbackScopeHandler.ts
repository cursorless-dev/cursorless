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

  static create(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: FallbackScopeType,
    languageId: string,
  ): ScopeHandler {
    const scopeHandlers = scopeType.scopeTypes.map((scopeType) =>
      scopeHandlerFactory.create(scopeType, languageId),
    );

    return this.createFromScopeHandlers(scopeHandlers);
  }

  static createFromScopeHandlers(scopeHandlers: ScopeHandler[]): ScopeHandler {
    return new FallbackScopeHandler(scopeHandlers);
  }

  private constructor(private scopeHandlers: ScopeHandler[]) {
    super();
  }

  get iterationScopeType(): ScopeType {
    throw new NoContainingScopeError(
      "Iteration scope for FallbackScopeHandler",
    );
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    for (const scopeHandler of this.scopeHandlers) {
      yield* scopeHandler.generateScopes(editor, position, direction, hints);
    }
  }
}
