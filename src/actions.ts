import { groupBy, toPairs } from "lodash";
import { Uri, window, workspace } from "vscode";
import EditStyles from "./editStyles";
import { TypedSelection } from "./Types";
import { promisify } from "util";
import { isLineSelectionType } from "./selectionType";

const sleep = promisify(setTimeout);

interface Action {
  (...args: TypedSelection[][]): Promise<any>;
  preferredPositions?: string[];
}

class Actions {
  constructor(private styles: EditStyles) {
    this.setSelection = this.setSelection.bind(this);
    this.setSelectionBefore = this.setSelectionBefore.bind(this);
    this.setSelectionAfter = this.setSelectionAfter.bind(this);
    this.delete = this.delete.bind(this);
    this.paste = this.paste.bind(this);

    this.paste.preferredPositions = ["after"];
    this.setSelectionAfter.preferredPositions = ["after"];
    this.setSelectionBefore.preferredPositions = ["before"];
  }

  setSelection: Action = async (targets: TypedSelection[]) => {
    const documentUris = targets.map((target) => target.selection.documentUri);
    if (new Set(documentUris).size > 1) {
      throw new Error("Can only select from one document at a time");
    }
    const documentUri = documentUris[0];
    const editor = window.visibleTextEditors.filter(
      (textEditor) => textEditor.document.uri === documentUri
    )[0];

    editor.selections = targets.map((target) => target.selection.selection);
    window.showTextDocument(editor.document);
  };

  setSelectionBefore: Action = async (targets: TypedSelection[]) => {
    this.setSelection(targets);
  };

  setSelectionAfter: Action = async (targets: TypedSelection[]) => {
    this.setSelection(targets);
  };

  delete: Action = async (targets: TypedSelection[]) => {
    await Promise.all(
      toPairs(
        groupBy(targets, (target) => target.selection.documentUri.toString())
      ).map(async ([documentUriString, selections]) => {
        const editor = window.visibleTextEditors.filter(
          (textEditor) =>
            textEditor.document.uri.toString() === documentUriString
        )[0];

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
            .filter((selection) => isLineSelectionType(selection.selectionType))
            // NB: We move end up one line because it will be at beginning of
            // next line
            .map((selection) =>
              selection.selection.selection.with(
                undefined,
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

        editor.edit((editBuilder) => {
          selections.forEach((selection) => {
            // TODO Properly handle last line of file
            // TODO Handle duplicate spaces and trim spaces
            editBuilder.delete(selection.selection.selection);
          });
        });
      })
    );
  };

  paste: Action = async (targets: TypedSelection[]) => {
    throw new Error("Not implemented");
  };
}

export default Actions;
