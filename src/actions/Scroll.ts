import { RevealLineAt } from "@cursorless/common";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { groupBy } from "../util/itertools";
import { Action, ActionReturnValue } from "./actions.types";

class Scroll implements Action {
  constructor(private graph: Graph, private at: RevealLineAt) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const selectionGroups = groupBy(targets, (t: Target) => t.editor);

    const lines = Array.from(selectionGroups, ([editor, targets]) => {
      return { lineNumber: getLineNumber(targets, this.at), editor };
    });

    const originalEditor = ide().activeEditableTextEditor;

    for (const lineWithEditor of lines) {
      await ide()
        .getEditableTextEditor(lineWithEditor.editor)
        .revealLine(lineWithEditor.lineNumber, this.at);
    }

    // If necessary focus back original editor
    if (originalEditor != null && !originalEditor.isActive) {
      await originalEditor.focus();
    }

    const decorationTargets = targets.filter((target) => {
      const visibleRanges = target.editor.visibleRanges;
      const startLine = visibleRanges[0].start.line;
      const endLine = visibleRanges[visibleRanges.length - 1].end.line;
      // Don't show decorations for selections that are larger than the visible range
      return (
        target.contentRange.start.line > startLine ||
        target.contentRange.end.line < endLine ||
        (target.contentRange.start.line === startLine &&
          target.contentRange.end.line === endLine)
      );
    });

    await this.graph.editStyles.displayPendingEditDecorationsForTargets(
      decorationTargets,
      this.graph.editStyles.referenced,
      false,
    );

    return {
      thatTargets: targets,
    };
  }
}

export class ScrollToTop extends Scroll {
  constructor(graph: Graph) {
    super(graph, RevealLineAt.top);
  }
}

export class ScrollToCenter extends Scroll {
  constructor(graph: Graph) {
    super(graph, RevealLineAt.center);
  }
}

export class ScrollToBottom extends Scroll {
  constructor(graph: Graph) {
    super(graph, RevealLineAt.bottom);
  }
}

function getLineNumber(targets: Target[], at: RevealLineAt) {
  let startLine = Number.MAX_SAFE_INTEGER;
  let endLine = 0;
  targets.forEach((target: Target) => {
    startLine = Math.min(startLine, target.contentRange.start.line);
    endLine = Math.max(endLine, target.contentRange.end.line);
  });

  if (at === RevealLineAt.top) {
    return startLine;
  }
  if (at === RevealLineAt.bottom) {
    return endLine;
  }
  return Math.floor((startLine + endLine) / 2);
}
