import * as vscode from "vscode";

export default async function vscodeOpenLink(
  editor: vscode.TextEditor,
  location: vscode.Position | vscode.Range | undefined,
): Promise<boolean> {
  const links = await getLinksForEditor(editor);
  const actualLocation = location ?? getSelection(editor);
  const filteredLinks = links.filter((link) =>
    link.range.contains(actualLocation),
  );

  if (filteredLinks.length > 1) {
    throw Error("Multiple links found at location");
  }

  if (filteredLinks.length === 0) {
    return false;
  }

  await openLink(filteredLinks[0]);

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
