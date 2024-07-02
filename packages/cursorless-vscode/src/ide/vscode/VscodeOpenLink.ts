import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import { OpenLinkOptions } from "../../../../common/src/types/TextEditor";

export default async function vscodeOpenLink(
  editor: VscodeTextEditorImpl,
  location: vscode.Position | vscode.Range | undefined,
  options: OpenLinkOptions,
): Promise<boolean> {
  const rawEditor = editor.vscodeEditor;
  const links = await getLinksForEditor(rawEditor);
  const actualLocation = location ?? getSelection(rawEditor);
  const filteredLinks = links.filter((link) =>
    link.range.contains(actualLocation),
  );

  if (filteredLinks.length > 1) {
    throw Error("Multiple links found at location");
  }

  if (filteredLinks.length === 0) {
    let commandId = options.openInSplit
      ? "editor.action.revealDefinitionAside"
      : "editor.action.revealDefinition";
    await vscode.commands.executeCommand(commandId);
  }

  try {
    await openLink(filteredLinks[0]);
  } catch (err) {
    // Fallback to moving cursor and running open link command

    // Set the selection to the link
    rawEditor.selections = [
      "start" in actualLocation
        ? new vscode.Selection(actualLocation.start, actualLocation.end)
        : new vscode.Selection(actualLocation, actualLocation),
    ];
    await editor.focus();

    // Run the open link command
    await vscode.commands.executeCommand("editor.action.openLink");
  }

  return true;
}

async function getLinksForEditor(
  editor: vscode.TextEditor,
): Promise<vscode.DocumentLink[]> {
  return (await vscode.commands.executeCommand(
    "vscode.executeLinkProvider",
    editor.document.uri,
  ))!;
}

function openLink(link: vscode.DocumentLink) {
  if (link.target == null) {
    throw Error("Document link is missing uri");
  }
  return openUri(link.target);
}

async function openUri(uri: vscode.Uri) {
  switch (uri.scheme) {
    case "http":
    case "https":
      await vscode.env.openExternal(uri);
      break;
    case "file":
      await vscode.window.showTextDocument(uri);
      break;
    default:
      throw Error(`Unknown uri scheme '${uri.scheme}'`);
  }
}

function getSelection(editor: vscode.TextEditor) {
  if (editor.selections.length > 1) {
    throw Error("Can't open links for multiple selections");
  }
  return editor.selection;
}
