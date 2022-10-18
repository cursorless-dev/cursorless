import { range } from "lodash";
import { Position, Range, TextEditor } from "vscode";
import { ScopeType } from "../../../core/commandVersionUpgrades/upgradeV2ToV3/targetDescriptorV2.types";
import { NoContainingScopeError } from "../../../errors";
import { Direction } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/range";
import { LineTarget } from "../../targets";
import {
  IterationScope,
  ScopeHandler,
  TargetScope,
} from "./scopeHandler.types";

export default class LineScopeHandler implements ScopeHandler {
  get scopeType(): ScopeType {
    return { type: "line" };
  }

  getScopesIntersectingPosition(
    editor: TextEditor,
    position: Position
  ): TargetScope[] {
    return [lineNumberToScope(editor, position.line)];
  }

  getScopesIntersectingRange(
    editor: TextEditor,
    { start, end }: Range
  ): TargetScope[] {
    return range(start.line, end.line + 1).map((lineNumber) =>
      lineNumberToScope(editor, lineNumber)
    );
  }

  getIterationScopesIntersectingPosition(
    editor: TextEditor,
    _position: Position
  ): IterationScope[] {
    return [
      {
        editor,
        domain: getDocumentRange(editor.document),
        scopes: range(editor.document.lineCount).map((lineNumber) =>
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
      throw new NoContainingScopeError(this.scopeType.type);
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
