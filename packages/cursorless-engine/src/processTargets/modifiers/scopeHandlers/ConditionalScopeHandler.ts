import {
  NoContainingScopeError,
  type Direction,
  type Position,
  type ScopeType,
  type TextEditor,
} from "@cursorless/common";
import { ifilter } from "itertools";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type {
  ConditionalScopeType,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";

export class ConditionalScopeHandler extends BaseScopeHandler {
  public scopeType = undefined;
  protected isHierarchical = true;

  constructor(
    public scopeHandlerFactory: ScopeHandlerFactory,
    private conditionalScopeType: ConditionalScopeType,
    private languageId: string,
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
    const scopeHandler = this.scopeHandlerFactory.create(
      this.conditionalScopeType,
      this.languageId,
    );

    return ifilter(
      scopeHandler.generateScopes(editor, position, direction, hints),
      this.conditionalScopeType.predicate,
    );
  }
}
