import type {
  Direction,
  Position,
  ScopeType,
  TextEditor,
  TextLine,
} from "@cursorless/common";
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
  const line = editor.document.lineAt(lineNumber);

  return {
    editor,
    domain: line.range,
    getTargets: (isReversed) => [
      createLineTarget(editor, isReversed, line, useFullLine),
    ],
  };
}

export function createLineTarget(
  editor: TextEditor,
  isReversed: boolean,
  line: TextLine,
  useFullRange = false,
) {
  return new LineTarget({
    editor,
    isReversed,
    contentRange:
      useFullRange || line.rangeTrimmed == null
        ? line.range
        : line.rangeTrimmed,
  });
}
