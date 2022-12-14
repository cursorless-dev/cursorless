import { Position, TextEditor } from "@cursorless/common";
import {
  Direction,
  SurroundingPairScopeType,
} from "../../../core/commandRunner/typings/targetDescriptor.types";
import BaseScopeHandler from "./BaseScopeHandler";
import { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

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
    _hints?: ScopeIteratorRequirements | undefined,
  ): Iterable<TargetScope> {
    throw new Error("Method not implemented.");
  }
}
