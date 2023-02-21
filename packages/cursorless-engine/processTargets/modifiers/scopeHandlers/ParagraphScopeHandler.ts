import {
  Position,
  Range,
  TextDocument,
  TextEditor,
  TextLine,
} from "@cursorless/common";
import { Direction, ScopeType } from "@cursorless/common";
import { ParagraphTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import { fitRangeToLineContent } from "./LineScopeHandler";
import { TargetScope } from "./scope.types";

export default class TokenScopeHandler extends BaseScopeHandler {
  public readonly scopeType: ScopeType = { type: "paragraph" };
  public readonly iterationScopeType: ScopeType = { type: "document" };
  protected readonly isHierarchical = false;

  constructor(_scopeType: ScopeType, _languageId: string) {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
  ): Iterable<TargetScope> {
    const { document } = editor;
    const offset = direction === "forward" ? 1 : -1;
    const stop = direction === "forward" ? document.lineCount : -1;
    let startLine = getStartLine(document, position, direction);
    let previousLine = editor.document.lineAt(position);

    for (let i = position.line + offset; i !== stop; i += offset) {
      const currentLine = editor.document.lineAt(i);

      if (currentLine.isEmptyOrWhitespace) {
        // End of paragraph
        if (startLine != null) {
          yield createScope(editor, startLine.range.union(previousLine.range));
          startLine = undefined;
        }
      }
      // Start of paragraph
      else if (startLine == null) {
        startLine = currentLine;
      }

      previousLine = currentLine;
    }

    // End of last paragraph
    if (startLine != null) {
      yield createScope(editor, startLine.range.union(previousLine.range));
    }
  }
}

/** Look in opposite direction for the start/edge of the paragraph */
function getStartLine(
  document: TextDocument,
  position: Position,
  direction: Direction,
): TextLine | undefined {
  const offset = direction === "forward" ? -1 : 1;
  const stop = direction === "forward" ? -1 : document.lineCount;
  let startLine = document.lineAt(position);

  if (startLine.isEmptyOrWhitespace) {
    return undefined;
  }

  for (let i = position.line + offset; i !== stop; i += offset) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {
      break;
    }
    startLine = line;
  }

  return startLine;
}

function createScope(editor: TextEditor, domain: Range): TargetScope {
  return {
    editor,
    domain,
    getTarget: (isReversed) =>
      new ParagraphTarget({
        editor,
        isReversed,
        contentRange: fitRangeToLineContent(editor, domain),
      }),
  };
}
