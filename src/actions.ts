import { commands, Selection, ViewColumn, window, workspace } from "vscode";
import update from "immutability-helper";
import EditStyles from "./editStyles";
import { TypedSelection } from "./Types";
import { promisify } from "util";
import { isLineSelectionType } from "./selectionType";
import { groupBy } from "./itertools";

const sleep = promisify(setTimeout);

interface Action {
  (...args: TypedSelection[][]): Promise<any>;
  preferredPositions?: string[];
}

const columnFocusCommands = {
  [ViewColumn.One]: "workbench.action.focusFirstEditorGroup",
  [ViewColumn.Two]: "workbench.action.focusSecondEditorGroup",
  [ViewColumn.Three]: "workbench.action.focusThirdEditorGroup",
  [ViewColumn.Four]: "workbench.action.focusFourthEditorGroup",
  [ViewColumn.Five]: "workbench.action.focusFifthEditorGroup",
  [ViewColumn.Six]: "workbench.action.focusSixthEditorGroup",
  [ViewColumn.Seven]: "workbench.action.focusSeventhEditorGroup",
  [ViewColumn.Eight]: "workbench.action.focusEighthEditorGroup",
  [ViewColumn.Nine]: "workbench.action.focusNinthEditorGroup",
  [ViewColumn.Active]: "",
  [ViewColumn.Beside]: "",
};

class Actions {
  constructor(private styles: EditStyles) {
    this.setSelection = this.setSelection.bind(this);
    this.setSelectionBefore = this.setSelectionBefore.bind(this);
    this.setSelectionAfter = this.setSelectionAfter.bind(this);
    this.delete = this.delete.bind(this);
    this.paste = this.paste.bind(this);

    this.paste.preferredPositions = ["after"];
  }

  setSelection: Action = async (targets: TypedSelection[]) => {
    const editors = targets.map((target) => target.selection.editor);
    if (new Set(editors).size > 1) {
      throw new Error("Can only select from one document at a time");
    }
    const editor = editors[0];

    editor.selections = targets.map((target) => target.selection.selection);
    if (editor.viewColumn != null) {
      await commands.executeCommand(columnFocusCommands[editor.viewColumn]);
    }
    editor.revealRange(editor.selections[0]);
  };

  setSelectionBefore: Action = async (targets: TypedSelection[]) => {
    this.setSelection(
      targets.map((target) =>
        update(target, {
          selection: {
            selection: {
              $apply: (selection) =>
                new Selection(selection.start, selection.start),
            },
          },
        })
      )
    );
  };

  setSelectionAfter: Action = async (targets: TypedSelection[]) => {
    this.setSelection(
      targets.map((target) =>
        update(target, {
          selection: {
            selection: {
              $apply: (selection) =>
                new Selection(selection.end, selection.end),
            },
          },
        })
      )
    );
  };

  delete: Action = async (targets: TypedSelection[]) => {
    await Promise.all(
      Array.from(
        groupBy(targets, (target) => target.selection.editor),
        async ([editor, selections]) => {
          editor.setDecorations(
            this.styles.pendingDelete,
            selections
              .filter(
                (selection) => !isLineSelectionType(selection.selectionType)
              )
              .map((selection) => selection.selection.selection)
          );

          editor.setDecorations(
            this.styles.pendingLineDelete,
            selections
              .filter((selection) =>
                isLineSelectionType(selection.selectionType)
              )
              .map((selection) =>
                selection.selection.selection.with(
                  undefined,
                  // NB: We move end up one line because it is at beginning of
                  // next line
                  selection.selection.selection.end.translate(-1)
                )
              )
          );

          const pendingEditDecorationTime = workspace
            .getConfiguration("cursorless")
            .get<number>("pendingEditDecorationTime")!;

          await sleep(pendingEditDecorationTime);

          editor.setDecorations(this.styles.pendingDelete, []);
          editor.setDecorations(this.styles.pendingLineDelete, []);

          await editor.edit((editBuilder) => {
            selections.forEach((selection) => {
              // TODO Properly handle last line of file
              // TODO Handle duplicate spaces and trim spaces
              editBuilder.delete(selection.selection.selection);
            });
          });
        }
      )
    );
  };

  paste: Action = async (targets: TypedSelection[]) => {
    throw new Error("Not implemented");
  };
}

export default Actions;
