import { Position, Range, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/rangeUtils";
import { DocumentTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class DocumentScopeHandler implements ScopeHandler {
  iterationScopeType = undefined;

  constructor(public scopeType: ScopeType, private _languageId: string) {}

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
    editor: TextEditor,
    _position: Position,
    offset: number,
    _direction: Direction
  ): TargetScope {
    if (offset === 0) {
      return getDocumentScope(editor);
    }

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
