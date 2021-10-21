import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { commands, Selection } from "vscode";

class EditNewLine implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private isAbove: boolean) {
    this.run = this.run.bind(this);
  }

  private correctForParagraph(targets: TypedSelection[]) {
    targets.forEach((target) => {
      let { start, end } = target.selection.selection;
      if (target.selectionType === "paragraph") {
        if (
          this.isAbove &&
          target.selectionContext.leadingDelimiterRange != null
        ) {
          start = start.translate({ lineDelta: -1 });
        } else if (
          !this.isAbove &&
          target.selectionContext.trailingDelimiterRange != null
        ) {
          end = end.translate({ lineDelta: 1 });
        }
        target.selection.selection = new Selection(start, end);
      }
    });
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    this.correctForParagraph(targets);
    if (this.isAbove) {
      await this.graph.actions.setSelectionBefore.run([targets]);
      await commands.executeCommand(
        targets[0].selectionContext.isNotebookCell
          ? "jupyter.insertCellAbove"
          : "editor.action.insertLineBefore"
      );
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
      await commands.executeCommand(
        targets[0].selectionContext.isNotebookCell
          ? "jupyter.insertCellBelow"
          : "editor.action.insertLineAfter"
      );
    }

    return {
      thatMark: targets.map((target) => ({
        selection: target.selection.editor.selection,
        editor: target.selection.editor,
      })),
    };
  }
}

export class EditNewLineAbove extends EditNewLine {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class EditNewLineBelow extends EditNewLine {
  constructor(graph: Graph) {
    super(graph, false);
  }
}
