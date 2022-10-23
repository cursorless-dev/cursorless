import { Position, Range, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/rangeUtils";
import { DocumentTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class DocumentScopeHandler implements ScopeHandler {
  public readonly scopeType = { type: "line" } as const;
  public readonly iterationScopeType = { type: "document" } as const;

  constructor(_scopeType: ScopeType, _languageId: string) {
    // Empty
  }

  getScopesTouchingPosition(
    editor: TextEditor,
    _position: Position,
    ancestorIndex: number = 0
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return [getDocumentScope(editor)];
  }

  getScopesOverlappingRange(editor: TextEditor, _range: Range): TargetScope[] {
    return [getDocumentScope(editor)];
  }

  getScopeRelativeToPosition(
    _editor: TextEditor,
    _position: Position,
    _offset: number,
    _direction: Direction
  ): TargetScope {
    // NB: offset will always be greater than or equal to 1, so this will be an
    // error
    throw new OutOfRangeError();
  }
}

function getDocumentScope(editor: TextEditor): TargetScope {
  const contentRange = getDocumentRange(editor.document);

  return {
    editor,
    domain: contentRange,
    getTarget: (isReversed) =>
      new DocumentTarget({
        editor,
        isReversed,
        contentRange,
      }),
  };
}
