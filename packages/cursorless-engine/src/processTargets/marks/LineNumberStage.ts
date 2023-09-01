import type { LineNumberMark, LineNumberType } from "@cursorless/common";
import type { TextEditor } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import type { MarkStage } from "../PipelineStages.types";
import { createLineTarget } from "../modifiers/scopeHandlers";
import type { LineTarget } from "../targets";

export default class implements MarkStage {
  constructor(private mark: LineNumberMark) {}

  run(): LineTarget[] {
    const editor = ide().activeTextEditor;
    if (editor == null) {
      return [];
    }
    const lineNumber = getLineNumber(
      editor,
      this.mark.lineNumberType,
      this.mark.lineNumber,
    );
    const contentRange = editor.document.lineAt(lineNumber).range;
    return [createLineTarget(editor, false, contentRange)];
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
          const visible = editor.visibleRanges.find(
            (r) =>
              currentLineNumber >= r.start.line &&
              currentLineNumber <= r.end.line,
          );
          if (visible) {
            visibleLines.push(currentLineNumber);
          } else {
            invisibleLines.push(currentLineNumber);
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
  }
};
