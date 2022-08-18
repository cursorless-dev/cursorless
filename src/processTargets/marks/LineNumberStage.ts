import { TextEditor } from "vscode";
import {
  LineNumberMark,
  LineNumberPosition,
} from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { createLineTarget } from "../modifiers/scopeTypeStages/LineStage";
import processTargets from "../processTargets";
import { MarkStage } from "../PipelineStages.types";
import LineTarget from "../targets/LineTarget";

export default class implements MarkStage {
  constructor(private modifier: LineNumberMark) {}

  run(context: ProcessedTargetsContext): LineTarget[] {
    if (context.currentEditor == null) {
      return [];
    }
    const editor = context.currentEditor;
    if (this.modifier.anchor && this.modifier.active) {
      const anchorLine = getLine(editor, this.modifier.anchor);
      const activeLine = getLine(editor, this.modifier.active);
      const anchorRange = editor.document.lineAt(anchorLine).range;
      const activeRange = editor.document.lineAt(activeLine).range;
      const contentRange = anchorRange.union(activeRange);
      const isReversed = this.modifier.anchor > this.modifier.active;
      return [createLineTarget(editor, isReversed, contentRange)];
    }
    const targetDescriptor = {
      type: "list" as const,
      elements:
        this.modifier.elements?.map((element) => ({
          type: "range" as const,
          anchor: {
            type: "primitive" as const,
            mark: {
              type: "lineNumber" as const,
              anchor: element.anchor,
              active: element.anchor,
            },
            modifiers: [],
          },
          active: {
            type: "primitive" as const,
            mark: {
              type: "lineNumber" as const,
              anchor: element.active,
              active: element.active,
            },
            modifiers: [],
          },
          excludeAnchor: element.excludeAnchor,
          excludeActive: element.excludeActive,
          rangeType: element.rangeType,
        })) ?? [],
    };
    return processTargets(context, [targetDescriptor])[0] as LineTarget[];

    // const lineTargets = this.modifier.elements?.map((element) => {
    //   const anchorLine = getLine(editor, element.anchor);
    //   const activeLine = getLine(editor, element.active);
    //   const anchorRange = editor.document.lineAt(anchorLine).range;
    //   const activeRange = editor.document.lineAt(activeLine).range;
    //   const anchorTarget = createLineTarget(editor, false, anchorRange);
    //   const activeTarget = createLineTarget(editor, false, activeRange);
    //   const isReversed = anchorLine > activeLine;
    //   const startTarget = isReversed ? activeTarget : anchorTarget;
    //   const endTarget = isReversed ? anchorTarget : activeTarget;
    //   const excludeStart = isReversed
    //     ? element.excludeActive
    //     : element.excludeAnchor;
    //   const excludeEnd = isReversed
    //     ? element.excludeAnchor
    //     : element.excludeActive;
    //   // TODO support range type
    //   return startTarget.createContinuousRangeTarget(
    //     isReversed,
    //     endTarget,
    //     !excludeStart,
    //     !excludeEnd
    //   ) as LineTarget;
    // });
    // return lineTargets ?? [];
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
