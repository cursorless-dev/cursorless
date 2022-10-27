import { Position, TextEditor } from "vscode";
import {
  Direction,
  SurroundingPairScopeType,
} from "../../../typings/targetDescriptor.types";
import { TargetScope } from "./scope.types";
import { ScopeHandler, ScopeIteratorHints } from "./scopeHandler.types";

export default class SurroundingPairScopeHandler implements ScopeHandler {
  public readonly iterationScopeType;

  constructor(
    public readonly scopeType: SurroundingPairScopeType,
    _languageId: string,
  ) {
    // FIXME: Figure out the actual iteration scope type
    this.iterationScopeType = this.scopeType;
  }

  generateScopesRelativeToPosition(
    _editor: TextEditor,
    _position: Position,
    _direction: Direction,
    _hints?: ScopeIteratorHints | undefined,
  ): Iterable<TargetScope> {
    throw new Error("Method not implemented.");
  }
}
