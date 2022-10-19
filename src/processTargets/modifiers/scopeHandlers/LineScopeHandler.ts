import { range } from "lodash";
import { Position, Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../../errors";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/range";
import { LineTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import type { IterationScope, TargetScope } from "./scope.types";
import type { ScopeHandler } from "./scopeHandler.types";

export default class LineScopeHandler implements ScopeHandler {
  public readonly scopeType: ScopeType = { type: "line" };
  public readonly iterationScopeType: ScopeType = { type: "document" };

  constructor(_scopeType: ScopeType, _languageId: string) {
    // empty
  }

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number = 0
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NoContainingScopeError(this.scopeType.type);
    }

    return [lineNumberToScope(editor, position.line)];
  }

  getScopesOverlappingRange(
    editor: TextEditor,
    { start, end }: Range
  ): TargetScope[] {
    return range(start.line, end.line + 1).map((lineNumber) =>
      lineNumberToScope(editor, lineNumber)
    );
  }

  getIterationScopesTouchingPosition(
    editor: TextEditor,
    _position: Position
  ): IterationScope[] {
    return [
      {
        editor,
        domain: getDocumentRange(editor.document),
        getScopes: () =>
          range(editor.document.lineCount).map((lineNumber) =>
            lineNumberToScope(editor, lineNumber)
          ),
      },
    ];
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction
  ): TargetScope {
    const lineNumber =
      direction === "forward" ? position.line + offset : position.line - offset;

    if (lineNumber < 0 || lineNumber >= editor.document.lineCount) {
      throw new OutOfRangeError();
    }

    return lineNumberToScope(editor, lineNumber);
  }
}

function lineNumberToScope(
  editor: TextEditor,
  lineNumber: number
): TargetScope {
  const { range } = editor.document.lineAt(lineNumber);

  return {
    editor,
    domain: range,
    getTarget: (isReversed) => createLineTarget(editor, isReversed, range),
  };
}

export function createLineTarget(
  editor: TextEditor,
  isReversed: boolean,
  range: Range
) {
  return new LineTarget({
    editor,
    isReversed,
    contentRange: fitRangeToLineContent(editor, range),
  });
}

export function fitRangeToLineContent(editor: TextEditor, range: Range) {
  const startLine = editor.document.lineAt(range.start);
  const endLine = editor.document.lineAt(range.end);
  const endCharacterIndex =
    endLine.range.end.character -
    (endLine.text.length - endLine.text.trimEnd().length);

  return new Range(
    startLine.lineNumber,
    startLine.firstNonWhitespaceCharacterIndex,
    endLine.lineNumber,
    endCharacterIndex
  );
}
