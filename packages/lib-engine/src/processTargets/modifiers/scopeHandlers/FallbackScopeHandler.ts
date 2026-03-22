import {
  type Direction,
  type Position,
  type TextEditor,
} from "@cursorless/lib-common";
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
    const scopeHandlers = scopeType.scopeTypes
      .map((scopeType) =>
        scopeHandlerFactory.maybeCreate(scopeType, languageId),
      )
      .filter(
        (scopeHandler): scopeHandler is ScopeHandler => scopeHandler != null,
      );

    if (scopeHandlers.length === 1) {
      return scopeHandlers[0];
    }

    return this.createFromScopeHandlers(scopeHandlers);
  }

  static createFromScopeHandlers(scopeHandlers: ScopeHandler[]): ScopeHandler {
    return new FallbackScopeHandler(scopeHandlers);
  }

  private constructor(private scopeHandlers: ScopeHandler[]) {
    super();
  }

  get iterationScopeType(): FallbackScopeType {
    return {
      type: "fallback",
      scopeTypes: this.scopeHandlers.map((s) => s.iterationScopeType),
    };
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
