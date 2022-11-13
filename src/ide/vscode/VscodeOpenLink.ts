import * as vscode from "vscode";

export default async function vscodeOpenLink(
  editor: vscode.TextEditor,
  location: vscode.Position | vscode.Range,
): Promise<boolean> {
  const links = await getLinksForEditor(editor);
  const filteredLinks = links.filter((link) => link.range.contains(location));

  if (filteredLinks.length > 1) {
    throw Error("Multiple links found at location");
  }

  if (filteredLinks.length === 0) {
    return false;
  }

  await openLink(filteredLinks[0]);

  return true;
}

function getLinksForEditor(editor: vscode.TextEditor) {
  return vscode.commands.executeCommand(
    "vscode.executeLinkProvider",
    editor.document.uri,
  ) as Thenable<vscode.DocumentLink[]>;
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
