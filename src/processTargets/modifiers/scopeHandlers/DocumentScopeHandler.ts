import { Position, Range, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { DocumentTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import { IterationScope, TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class DocumentScopeHandler implements ScopeHandler {
  iterationScopeType = undefined;

  constructor(public scopeType: ScopeType, private languageId: string) {}

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number = 0
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return this.getIterationScope(editor).getScopes();
  }

  getScopesOverlappingRange(editor: TextEditor, _range: Range): TargetScope[] {
    return this.getIterationScope(editor).getScopes();
  }

  getIterationScopesTouchingPosition(
    editor: TextEditor,
    _position: Position
  ): IterationScope[] {
    return [this.getIterationScope(editor)];
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    _direction: Direction
  ): TargetScope {
    if (offset === 0) {
      return this.getIterationScope(editor).getScopes()[0];
    }

    throw new OutOfRangeError();
  }

  private getIterationScope(editor: TextEditor): IterationScope {
    const contentRange = new Range(
      new Position(0, 0),
      editor.document.lineAt(editor.document.lineCount - 1).range.end
    );

    return {
      editor,
      domain: contentRange,
      getScopes: () => [
        {
          editor,
          domain: contentRange,
          getTarget: (isReversed) =>
            new DocumentTarget({
              editor,
              isReversed,
              contentRange,
            }),
        },
      ],
    };
  }
}
