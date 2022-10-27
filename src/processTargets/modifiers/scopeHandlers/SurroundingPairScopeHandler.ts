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

  getPreferredScopeTouchingPosition(
    editor: TextEditor,
    position: Position,
  ): TargetScope | undefined {
    throw new Error("Method not implemented.");
  }

  generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorHints | undefined,
  ): Iterable<TargetScope> {
    throw new Error("Method not implemented.");
  }
}
