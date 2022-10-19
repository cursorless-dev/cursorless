import { TextEditor, Position, Range } from "vscode";
import {
  Direction,
  SurroundingPairScopeType,
} from "../../../typings/targetDescriptor.types";
import { ScopeHandler } from "./scopeHandler.types";
import { IterationScope, TargetScope } from "./scope.types";

export default class SurroundingPairScopeHandler implements ScopeHandler {
  constructor(
    public readonly scopeType: SurroundingPairScopeType,
    _languageId: string
  ) {}

  get iterationScopeType() {
    return undefined;
  }

  getScopesTouchingPosition(
    _editor: TextEditor,
    _position: Position
  ): TargetScope[] {
    // TODO: Run existing surrounding pair code on empty range constructed from
    // position, returning both if position is adjacent to to
    throw new Error("Method not implemented.");
  }

  getScopesOverlappingRange(_editor: TextEditor, _range: Range): TargetScope[] {
    // TODO: Implement https://github.com/cursorless-dev/cursorless/pull/1031#issuecomment-1276777449
    throw new Error("Method not implemented.");
  }

  getIterationScopesTouchingPosition(
    _editor: TextEditor,
    _position: Position
  ): IterationScope[] {
    // TODO: Return inside strict containing pair
    throw new Error("Method not implemented.");
  }

  getScopeRelativeToPosition(
    _editor: TextEditor,
    _position: Position,
    _offset: number,
    _direction: Direction
  ): TargetScope {
    // TODO: Walk forward until we hit either an opening or closing delimiter.
    // If we hit an opening delimiter then we walk over as many pairs as we need
    // to until we have offset. If we *first* instead hit a closing PR en then we
    // expand containing and walk forward from that
    throw new Error("Method not implemented.");
  }
}
