import type { TextEditor } from "vscode";
import type {
  LineNumberMark,
  LineNumberType,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import { createLineTarget } from "../modifiers/scopeTypeStages/LineStage";
import type { MarkStage } from "../PipelineStages.types";
import { LineTarget } from "../targets";

export default class implements MarkStage {
  constructor(private mark: LineNumberMark) {}

  run(context: ProcessedTargetsContext): LineTarget[] {
    if (context.currentEditor == null) {
      return [];
    }
    const editor = context.currentEditor;
    const lineNumber = getLineNumber(
      editor,
      this.mark.lineType,
      this.mark.lineNumber
    );
    const contentRange = editor.document.lineAt(lineNumber).range;
    return [createLineTarget(editor, false, contentRange)];
  }
}

const getLineNumber = (
  editor: TextEditor,
  lineType: LineNumberType,
  lineNumber: number
) => {
  switch (lineType) {
    case "absolute":
      return lineNumber;
    case "relative":
      return editor.selection.active.line + lineNumber;
    case "modulo100": {
      const stepSize = 100;
      const startLine = editor.visibleRanges[0].start.line;
      const endLine =
        editor.visibleRanges[editor.visibleRanges.length - 1].end.line;
      const base = Math.floor(startLine / stepSize) * stepSize;
      const visibleLines = [];
      const invisibleLines = [];
      lineNumber = base + lineNumber;
      while (lineNumber <= endLine) {
        if (lineNumber >= startLine) {
          const visible = editor.visibleRanges.find(
            (r) => lineNumber >= r.start.line && lineNumber <= r.end.line
          );
          if (visible) {
            visibleLines.push(lineNumber);
          } else {
            invisibleLines.push(lineNumber);
          }
        }
        lineNumber += stepSize;
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
