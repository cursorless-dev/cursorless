import type {
  Direction,
  Position,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { Range } from "@cursorless/common";
import { LineTarget } from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";

interface LineScopeType {
  type: "line" | "fullLine";
}

export class LineScopeHandler extends BaseScopeHandler {
  public readonly iterationScopeType: ScopeType = {
    type: "paragraph",
  } as const;
  protected readonly isHierarchical = false;
  public readonly includeAdjacentInEvery = true;

  constructor(
    public readonly scopeType: LineScopeType,
    _languageId: string,
  ) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
  ): Iterable<TargetScope> {
    const useFullLine = this.scopeType.type === "fullLine";

    if (direction === "forward") {
      for (let i = position.line; i < editor.document.lineCount; i++) {
        yield lineNumberToScope(editor, useFullLine, i);
      }
    } else {
      for (let i = position.line; i >= 0; i--) {
        yield lineNumberToScope(editor, useFullLine, i);
      }
    }
  }
}

function lineNumberToScope(
  editor: TextEditor,
  useFullLine: boolean,
  lineNumber: number,
): TargetScope {
  const { range } = editor.document.lineAt(lineNumber);

  return {
    editor,
    domain: range,
    getTargets: (isReversed) => [
      createLineTarget(editor, isReversed, range, useFullLine),
    ],
  };
}

export function createLineTarget(
  editor: TextEditor,
  isReversed: boolean,
  range: Range,
  useUnmodifiedRange = false,
) {
  return new LineTarget({
    editor,
    isReversed,
    contentRange: useUnmodifiedRange
      ? range
      : fitRangeToLineContent(editor, range),
  });
}

export function fitRangeToLineContent(editor: TextEditor, range: Range) {
  const startLine = editor.document.lineAt(range.start);
  const endLine = editor.document.lineAt(range.end);
  return new Range(
    startLine.rangeTrimmed?.start ?? startLine.range.start,
    endLine.rangeTrimmed?.end ?? endLine.range.end,
  );
}
