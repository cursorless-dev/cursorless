import { Position, Range, TextEditor } from "vscode";
import { ScopeType } from "../../../typings/targetDescriptor.types";
import { ParagraphTarget } from "../../targets";
import { fitRangeToLineContent } from "./LineScopeHandler";
import NestedScopeHandler from "./NestedScopeHandler";
import NotHierarchicalScopeError from "./NotHierarchicalScopeError";
import { TargetScope } from "./scope.types";

export default class TokenScopeHandler extends NestedScopeHandler {
  public readonly scopeType: ScopeType = { type: "paragraph" };
  public readonly iterationScopeType: ScopeType = { type: "document" };

  getScopesTouchingPosition(
    editor: TextEditor,
    position: Position,
    ancestorIndex: number = 0,
  ): TargetScope[] {
    if (ancestorIndex !== 0) {
      throw new NotHierarchicalScopeError(this.scopeType);
    }

    return getScopesOverlappingRange(editor, new Range(position, position));
  }

  protected getScopesInSearchScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return getScopesOverlappingRange(editor, domain);
  }
}

function getScopesOverlappingRange(
  editor: TextEditor,
  range: Range,
): TargetScope[] {
  const { startLine, endLine } = calculateSearchRange(editor, range);

  const scopes: TargetScope[] = [];
  let paragraphStart = startLine.isEmptyOrWhitespace
    ? undefined
    : startLine.range.start;

  for (let i = startLine.lineNumber; i <= endLine.lineNumber; ++i) {
    const line = editor.document.lineAt(i);

    if (line.isEmptyOrWhitespace) {
      // End of paragraph
      if (paragraphStart != null) {
        scopes.push(
          createScope(
            editor,
            new Range(paragraphStart, editor.document.lineAt(i - 1).range.end),
          ),
        );
        paragraphStart = undefined;
      }
    }
    // Start of paragraph
    else if (paragraphStart == null) {
      paragraphStart = line.range.start;
    }

    // End of last paragraph
    if (paragraphStart != null && i === endLine.lineNumber) {
      scopes.push(
        createScope(editor, new Range(paragraphStart, endLine.range.end)),
      );
    }
  }

  return scopes;
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
