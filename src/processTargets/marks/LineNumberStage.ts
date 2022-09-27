import type { TextEditor } from "vscode";
import type {
  LineNumberMark,
  LineNumberPosition,
} from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import { createLineTarget } from "../modifiers/scopeTypeStages/LineStage";
import type { MarkStage } from "../PipelineStages.types";
import { LineTarget } from "../targets";

export default class implements MarkStage {
  constructor(private modifier: LineNumberMark) {}

  run(context: ProcessedTargetsContext): LineTarget[] {
    if (context.currentEditor == null) {
      return [];
    }
    const editor = context.currentEditor;
    const anchorLine = getLine(editor, this.modifier.anchor);
    const activeLine = getLine(editor, this.modifier.active);
    const anchorRange = editor.document.lineAt(anchorLine).range;
    const activeRange = editor.document.lineAt(activeLine).range;
    const contentRange = anchorRange.union(activeRange);
    const isReversed = this.modifier.anchor < this.modifier.active;
    return [createLineTarget(editor, isReversed, contentRange)];
  }
}

const getLine = (editor: TextEditor, linePosition: LineNumberPosition) => {
  switch (linePosition.type) {
    case "absolute":
      return linePosition.lineNumber;
    case "relative":
      return editor.selection.active.line + linePosition.lineNumber;
    case "modulo100": {
      const stepSize = 100;
      const startLine = editor.visibleRanges[0].start.line;
      const endLine =
        editor.visibleRanges[editor.visibleRanges.length - 1].end.line;
      const base = Math.floor(startLine / stepSize) * stepSize;
      const visibleLines = [];
      const invisibleLines = [];
      let lineNumber = base + linePosition.lineNumber;
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
