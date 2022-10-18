import { TextEditor, Position, Range } from "vscode";
import { ScopeType } from "../../../core/commandVersionUpgrades/upgradeV2ToV3/targetDescriptorV2.types";
import { Direction } from "../../../typings/targetDescriptor.types";
import {
  IterationScope,
  ScopeHandler,
  TargetScope,
} from "./scopeHandler.types";

export default class SurroundingPairScopeHandler implements ScopeHandler {
  scopeType: ScopeType;

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): TargetScope[] {
    // TODO: Run existing surrounding pair code on empty range constructed from
    // position, returning both if position is adjacent to to
    throw new Error("Method not implemented.");
  }

  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    // TODO: Implement https://github.com/cursorless-dev/cursorless/pull/1031#issuecomment-1276777449
    throw new Error("Method not implemented.");
  }

  getIterationScopesTouchingPosition(
    editor: TextEditor,
    position: Position
  ): IterationScope[] {
    // TODO: Return inside strict containing pair
    throw new Error("Method not implemented.");
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): TargetScope {
    // TODO: Walk forward until we hit either an opening or closing delimiter.
    // If we hit an opening delimiter then we walk over as many pairs as we need
    // to until we have offset. If we *first* instead hit a closing PR en then we
    // expand containing and walk forward from that
    throw new Error("Method not implemented.");
  }
}
