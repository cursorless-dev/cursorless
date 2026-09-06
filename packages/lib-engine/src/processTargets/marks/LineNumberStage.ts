import type {
  IDE,
  LineNumberMark,
  LineNumberType,
  TextEditor,
} from "@cursorless/lib-common";
import type { MarkStage } from "../PipelineStages.types";
import type { LineTarget } from "../targets";
import { createLineTarget } from "../targets";

export class LineNumberStage implements MarkStage {
  constructor(
    private ide: IDE,
    private mark: LineNumberMark,
  ) {}

  run(): LineTarget[] {
    const editor = this.ide.activeTextEditor;
    if (editor == null) {
      return [];
    }
    const lineNumber = getLineNumber(
      editor,
      this.mark.lineNumberType,
      this.mark.lineNumber,
    );
    const line = editor.document.lineAt(lineNumber);
    return [createLineTarget(editor, false, line)];
  }
}

const getLineNumber = (
  editor: TextEditor,
  lineNumberType: LineNumberType,
  lineNumber: number,
) => {
  switch (lineNumberType) {
    case "absolute":
      return lineNumber;

    case "relative":
      return editor.selections[0].active.line + lineNumber;

    case "modulo100": {
      const stepSize = 100;
      const startLine = editor.visibleRanges[0].start.line;
      const endLine =
        editor.visibleRanges[editor.visibleRanges.length - 1].end.line;
      const base = Math.floor(startLine / stepSize) * stepSize;
      const visibleLines = [];
      const invisibleLines = [];
      let currentLineNumber = base + lineNumber;
      while (currentLineNumber <= endLine) {
        if (currentLineNumber >= startLine) {
          const lineNumber = currentLineNumber;
          const visible = editor.visibleRanges.find(
            (r) => lineNumber >= r.start.line && lineNumber <= r.end.line,
          );
          if (visible) {
            visibleLines.push(lineNumber);
          } else {
            invisibleLines.push(lineNumber);
          }
        }
        currentLineNumber += stepSize;
      }
      if (visibleLines.length === 1) {
        return visibleLines[0];
      }
      if (visibleLines.length + invisibleLines.length > 1) {
        throw new Error("Multiple lines matching");
      }
      if (invisibleLines.length === 1) {
        return invisibleLines[0];
      }
      throw new Error("Line is not in viewport");
    }

    // No default
  }
};
