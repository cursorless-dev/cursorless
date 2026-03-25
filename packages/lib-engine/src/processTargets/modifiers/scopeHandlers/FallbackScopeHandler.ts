import {
  type Direction,
  type Position,
  type TextEditor,
} from "@cursorless/lib-common";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  FallbackScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

export class FallbackScopeHandler extends BaseScopeHandler {
  public scopeType = undefined;
  protected isHierarchical = true;

  static maybeCreate(
    scopeHandlerFactory: ScopeHandlerFactory,
    scopeType: FallbackScopeType,
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

    return new FallbackScopeHandler(scopeHandlers);
  }

  constructor(private scopeHandlers: ScopeHandler[]) {
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
