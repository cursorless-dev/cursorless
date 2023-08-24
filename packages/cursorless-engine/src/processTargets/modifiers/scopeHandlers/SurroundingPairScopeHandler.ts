import type { Position, TextEditor } from "@cursorless/common";
import type { Direction, SurroundingPairScopeType } from "@cursorless/common";
import BaseScopeHandler from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type { ScopeIteratorRequirements } from "./scopeHandler.types";

export default class SurroundingPairScopeHandler extends BaseScopeHandler {
  public readonly iterationScopeType;

  protected isHierarchical = true;

  constructor(
    public readonly scopeType: SurroundingPairScopeType,
    _languageId: string,
  ) {
    super();
    this.iterationScopeType = this.scopeType;
  }

  generateScopeCandidates(
    _editor: TextEditor,
    _position: Position,
    _direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    throw new Error("Method not implemented.");
  }
}
