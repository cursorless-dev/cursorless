import { Range, TextEditor, window } from "vscode";
import { LineNumber, LineNumberPosition } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import PipelineStage from "./PipelineStage";

export default class implements PipelineStage {
  run(
    context: ProcessedTargetsContext,
    stage: LineNumber
  ): TypedSelection | TypedSelection[] {
    if (window.activeTextEditor == null) {
      return [];
    }
    const editor = window.activeTextEditor;
    return {
      editor,
      contentRange: new Range(
        getLine(editor, stage.anchor),
        0,
        getLine(editor, stage.active),
        0
      ),
    };
  }
}

const getLine = (editor: TextEditor, linePosition: LineNumberPosition) => {
  switch (linePosition.type) {
    case "absolute":
      return linePosition.lineNumber;
    case "relative":
      return editor.selection.active.line + linePosition.lineNumber;
    case "modulo100":
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
};
