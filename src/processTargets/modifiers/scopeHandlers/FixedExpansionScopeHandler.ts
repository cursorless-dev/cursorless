import { Position, Range, TextEditor } from "vscode";
import {
  Direction,
  FixedExpansionScopeType,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import { makeEmptyRange } from "../../../util/rangeUtils";
import { PlainTarget } from "../../targets";
import { expandRange } from "./expandRange";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class FixedExpansionScopeHandler implements ScopeHandler {
  public readonly scopeType: FixedExpansionScopeType;
  public readonly iterationScopeType = { type: "document" } as const;

  constructor(scopeType: ScopeType, _languageId: string) {
    this.scopeType = scopeType as FixedExpansionScopeType;
  }

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number | undefined = 0,
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return [this.getScopeForRange(editor, makeEmptyRange(position))];
  }

  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    return [this.getScopeForRange(editor, range)];
  }

  private getScopeForRange(editor: TextEditor, inputRange: Range): TargetScope {
    const { numCharacters } = this.scopeType;
    const range = expandRange(
      numCharacters,
      numCharacters,
      editor.document,
      inputRange,
    );

    return {
      editor,
      domain: range,
      getTarget: (isReversed) =>
        new PlainTarget({
          editor,
          contentRange: range,
          isReversed,
        }),
    };
  }

  getScopeRelativeToPosition(
    _editor: TextEditor,
    _position: Position,
    _offset: number,
    _direction: Direction,
  ): TargetScope {
    throw new Error("Method not implemented.");
  }
}
