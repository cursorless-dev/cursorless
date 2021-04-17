import { groupBy, toPairs } from "lodash";
import { Uri, window } from "vscode";
import { TypedSelection } from "./Types";

type Actions = Record<string, function>;

const actions: Actions = {
  setSelection(targets: TypedSelection[]) {
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
  },

  delete(targets: TypedSelection[]) {
    toPairs(
      groupBy(targets, (target) => target.selection.documentUri.toString())
    ).forEach(([documentUriString, selections]) => {
      const editor = window.visibleTextEditors.filter(
        (textEditor) => textEditor.document.uri.toString() === documentUriString
      )[0];

      editor.edit((editBuilder) => {
        selections.forEach((selection) => {
          // TODO Properly handle last line of file
          // TODO Handle duplicate spaces and trim spaces
          editBuilder.delete(selection.selection.selection);
        });
      });
    });
  },
};

export default actions;
