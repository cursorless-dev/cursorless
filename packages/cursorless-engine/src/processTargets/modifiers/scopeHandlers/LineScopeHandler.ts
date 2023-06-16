import { Position, Range, TextEditor } from "@cursorless/common";
import { Direction, ScopeType } from "@cursorless/common";
import { LineTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";

export default class LineScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "line" } as const;
  public readonly iterationScopeType = { type: "document" } as const;
  protected readonly isHierarchical = false;
  public readonly includeAdjacentInEvery: boolean = true;

  constructor(_scopeType: ScopeType, _languageId: string) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
  ): Iterable<TargetScope> {
    if (direction === "forward") {
      for (let i = position.line; i < editor.document.lineCount; i++) {
        yield lineNumberToScope(editor, i);
      }
    } else {
      for (let i = position.line; i >= 0; i--) {
        yield lineNumberToScope(editor, i);
      }
    }
  }
}

function lineNumberToScope(
  editor: TextEditor,
  lineNumber: number,
): TargetScope {
  const { range } = editor.document.lineAt(lineNumber);

  return {
    editor,
    domain: range,
    getTargets: (isReversed) => [createLineTarget(editor, isReversed, range)],
  };
}

export function createLineTarget(
  editor: TextEditor,
  isReversed: boolean,
  range: Range,
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

  return new Range(
    startLine.lineNumber,
    startLine.firstNonWhitespaceCharacterIndex,
    endLine.lineNumber,
    endLine.lastNonWhitespaceCharacterIndex,
  );
}
