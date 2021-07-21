import { commands, window, Selection, TextEditor } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
  SelectionWithEditor,
} from "./Types";
import displayPendingEditDecorations from "./editDisplayUtils";
import { runOnTargetsForEachEditor } from "./targetUtils";
import { focusEditor } from "./setSelectionsAndFocusEditor";
import { flatten } from "lodash";

export default class CommandAction implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private command: string) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced,
      this.graph.editStyles.referencedLine
    );

    const originalEditor = window.activeTextEditor;

    const thatMark = flatten(
      await runOnTargetsForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, selections) => {
          // For command to the work we have to have the correct editor focused
          if (editor !== window.activeTextEditor) {
            await focusEditor(editor);
          }

          const originalSelections = editor.selections;

          const newSelections = selections.map(
            (selection) => selection.selection.selection
          );

          editor.selections = newSelections;

          await commands.executeCommand(this.command);

          // Map of line numbers mapping to the delta in character index for that line.
          const lineDeltas = calculateLineChanges(editor, newSelections);

          const updateSelection = (selection: Selection) =>
            new Selection(
              selection.start.line,
              selection.start.character +
                (lineDeltas[selection.start.line] ?? 0),
              selection.end.line,
              selection.end.character + (lineDeltas[selection.end.line] ?? 0)
            );

          const thatMark = newSelections.map((selection) => ({
            editor,
            selection: updateSelection(selection),
          }));

          // Reset original selections
          editor.selections = originalSelections.map(updateSelection);

          return thatMark;
        }
      )
    );

    // If necessary focus back original editor
    if (originalEditor != null && originalEditor !== window.activeTextEditor) {
      await focusEditor(originalEditor);
    }

    return { returnValue: null, thatMark };
  }
}

function calculateLineChanges(
  editor: TextEditor,
  selectionsBefore: Selection[]
) {
  const lineDeltas: { [key: number]: number } = {};
  editor.selections.forEach((selectionAfter, index) => {
    const selectionBefore = selectionsBefore[index];
    const deltaStart =
      selectionAfter.start.character - selectionBefore.start.character;
    const deltaEnd =
      selectionAfter.end.character - selectionBefore.end.character;
    const delta =
      Math.abs(deltaStart) > Math.abs(deltaEnd) ? deltaStart : deltaEnd;
    for (
      let i = selectionBefore.start.line;
      i <= selectionBefore.end.line;
      ++i
    ) {
      lineDeltas[i] = delta;
    }
  });
  return lineDeltas;
}
