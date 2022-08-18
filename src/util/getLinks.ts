import * as vscode from "vscode";
import { Target } from "../typings/target.types";

export async function getLinksForSelections(
  editor: vscode.TextEditor,
  selections: vscode.Selection[]
) {
  const links = await getLinksForEditor(editor);
  return links.filter((link) =>
    selections.find((selection) => link.range.contains(selection))
  );
}

export async function getLinkForTarget(target: Target) {
  const links = await getLinksForEditor(target.editor);
  return links.find((link) => link.range.contains(target.contentRange));
}

function getLinksForEditor(editor: vscode.TextEditor) {
  return vscode.commands.executeCommand(
    "vscode.executeLinkProvider",
    editor.document.uri
  ) as Thenable<vscode.DocumentLink[]>;
}
