import { Position, Range, TextEditor } from "vscode";
import {
  Direction,
  SurroundingPairScopeType,
} from "../../../typings/targetDescriptor.types";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class SurroundingPairScopeHandler implements ScopeHandler {
  public readonly iterationScopeType;

  constructor(
    public readonly scopeType: SurroundingPairScopeType,
    _languageId: string,
  ) {
    // FIXME: Figure out the actual iteration scope type
    this.iterationScopeType = this.scopeType;
  }

  getScopesTouchingPosition(
    _editor: TextEditor,
    _position: Position,
    _ancestorIndex: number = 0,
  ): TargetScope[] {
    // TODO: Run existing surrounding pair code on empty range constructed from
    // position, returning both if position is adjacent to two
    // TODO: Handle ancestor index
    throw new Error("Method not implemented.");
  }

  getScopesOverlappingRange(_editor: TextEditor, _range: Range): TargetScope[] {
    // TODO: Implement https://github.com/cursorless-dev/cursorless/pull/1031#issuecomment-1276777449
    throw new Error("Method not implemented.");
  }

  getScopeRelativeToPosition(
    _editor: TextEditor,
    _position: Position,
    _offset: number,
    _direction: Direction,
  ): TargetScope {
    // TODO: Walk forward until we hit either an opening or closing delimiter.
    // If we hit an opening delimiter then we walk over as many pairs as we need
    // to until we have offset. If we *first* instead hit a closing PR en then we
    // expand containing and walk forward from that
    throw new Error("Method not implemented.");
  }
}
