import { Position, Range, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { ParagraphTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import { fitRangeToLineContent } from "./LineScopeHandler";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class ParagraphScopeHandler implements ScopeHandler {
  public readonly iterationScopeType = { type: "document" } as const;

  constructor(public scopeType: ScopeType, _languageId: string) {}

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number = 0,
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return this.getScopesOverlappingRange(
      editor,
      new Range(position, position),
    );
  }

  getScopesOverlappingRange(editor: TextEditor, range: Range): TargetScope[] {
    const searchRange = calculateSearchRange(editor, range);

    const { startLine, endLine } = searchRange;
    const scopes: TargetScope[] = [];
    let paragraphStart = startLine.isEmptyOrWhitespace
      ? -1
      : startLine.lineNumber;

    for (let i = startLine.lineNumber; i <= endLine.lineNumber; ++i) {
      const line = editor.document.lineAt(i);

      if (line.isEmptyOrWhitespace) {
        // End of paragraph
        if (paragraphStart > -1) {
          scopes.push(
            createScope(editor, new Range(paragraphStart, 0, i - 1, 0)),
          );
          paragraphStart = -1;
        }
      }
      // Start of paragraph
      else if (paragraphStart < 0) {
        paragraphStart = i;
      }

      // End of last paragraph
      if (i === endLine.lineNumber && !endLine.isEmptyOrWhitespace) {
        scopes.push(createScope(editor, new Range(paragraphStart, 0, i, 0)));
      }
    }

    return scopes;
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction,
  ): TargetScope {
    if (offset === 0) {
      const scopes = this.getScopesTouchingPosition(editor, position);
      if (scopes.length > 0) {
        return scopes[0];
      }
    }

    throw new OutOfRangeError();
  }
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

function calculateSearchRange(editor: TextEditor, range: Range) {
  const { document } = editor;
  let startLine = document.lineAt(range.start);
  let endLine = document.lineAt(range.end);

  if (!startLine.isEmptyOrWhitespace) {
    while (startLine.lineNumber > 0) {
      const line = document.lineAt(startLine.lineNumber - 1);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      startLine = line;
    }
  }

  if (!endLine.isEmptyOrWhitespace) {
    while (endLine.lineNumber + 1 < document.lineCount) {
      const line = document.lineAt(endLine.lineNumber + 1);
      if (line.isEmptyOrWhitespace) {
        break;
      }
      endLine = line;
    }
  }

  return { startLine, endLine };
}
