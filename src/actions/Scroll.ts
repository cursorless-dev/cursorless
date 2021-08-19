import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { displayDecorationsWhileRunningFunc } from "../util/editDisplayUtils";
import { groupBy } from "../util/itertools";
import { commands, window, workspace } from "vscode";
import { focusEditor } from "../util/setSelectionsAndFocusEditor";

class Scroll implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private at: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const selectionGroups = groupBy(
      targets,
      (t: TypedSelection) => t.selection.editor
    );

    const lines = Array.from(selectionGroups, ([editor, targets]) => {
      return { lineNumber: getLineNumber(targets, this.at), editor };
    });

    const scrollCallback = async () => {
      const originalEditor = window.activeTextEditor;

      for (const lineWithEditor of lines) {
        // For reveal line to the work we have to have the correct editor focused
        if (lineWithEditor.editor !== window.activeTextEditor) {
          await focusEditor(lineWithEditor.editor);
        }
        await commands.executeCommand("revealLine", {
          lineNumber: lineWithEditor.lineNumber,
          at: this.at,
        });
      }

      // If necessary focus back original editor
      if (
        originalEditor != null &&
        originalEditor !== window.activeTextEditor
      ) {
        await focusEditor(originalEditor);
      }
    };

    const showAdditionalHighlightBeforeScroll = workspace
      .getConfiguration("cursorless")
      .get<boolean>("showAdditionalHighlightBeforeScroll")!;

    await displayDecorationsWhileRunningFunc(
      targets.map((target) => target.selection),
      this.graph.editStyles.referenced.line,
      scrollCallback,
      showAdditionalHighlightBeforeScroll
    );

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }
}

export class ScrollToTop extends Scroll {
  constructor(graph: Graph) {
    super(graph, "top");
  }
}

export class ScrollToCenter extends Scroll {
  constructor(graph: Graph) {
    super(graph, "center");
  }
}

export class ScrollToBottom extends Scroll {
  constructor(graph: Graph) {
    super(graph, "bottom");
  }
}

function getLineNumber(targets: TypedSelection[], at: string) {
  let startLine = Number.MAX_SAFE_INTEGER;
  let endLine = 0;
  targets.forEach((t: TypedSelection) => {
    startLine = Math.min(startLine, t.selection.selection.start.line);
    endLine = Math.max(endLine, t.selection.selection.end.line);
  });

  if (at === "top") {
    return startLine;
  }
  if (at === "bottom") {
    return endLine;
  }
  return Math.floor((startLine + endLine) / 2);
}
