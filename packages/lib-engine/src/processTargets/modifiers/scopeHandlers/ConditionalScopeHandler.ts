import {
  NoContainingScopeError,
  type Direction,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/lib-common";
import { ifilter } from "itertools";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  ConditionalScopeType,
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

export class ConditionalScopeHandler extends BaseScopeHandler {
  public scopeType = undefined;
  protected isHierarchical = true;

  static maybeCreate(
    scopeHandlerFactory: ScopeHandlerFactory,
    conditionalScopeType: ConditionalScopeType,
    languageId: string,
  ): ConditionalScopeHandler | undefined {
    const scopeHandler = scopeHandlerFactory.maybeCreate(
      conditionalScopeType.scopeType,
      languageId,
    );

    if (scopeHandler == null) {
      return undefined;
    }

    return new ConditionalScopeHandler(scopeHandler, conditionalScopeType);
  }

  private constructor(
    private scopeHandler: ScopeHandler,
    private conditionalScopeType: ConditionalScopeType,
  ) {
    super();
  }

  get iterationScopeType(): ScopeType {
    throw new NoContainingScopeError(
      "Iteration scope for ConditionalScopeHandler",
    );
  }

  generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    return ifilter(
      this.scopeHandler.generateScopes(editor, position, direction, hints),
      this.conditionalScopeType.predicate,
    );
  }
}
