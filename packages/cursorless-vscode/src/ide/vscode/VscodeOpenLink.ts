import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";
import { OpenLinkOptions, Range } from "@cursorless/common";
import { toVscodePositionOrRange } from "@cursorless/vscode-common";

export default async function vscodeOpenLink(
  editor: VscodeTextEditorImpl,
  range: Range,
  { openAside }: OpenLinkOptions,
): Promise<void> {
  const rawEditor = editor.vscodeEditor;
  const links = await getLinksForEditor(rawEditor);
  const vscodeRange = toVscodePositionOrRange(range);
  const filteredLinks = links.filter((link) =>
    link.range.contains(vscodeRange),
  );

  if (filteredLinks.length > 1) {
    throw Error("Multiple links found at location");
  }

  if (filteredLinks.length === 0) {
    await runCommandAtRange(
      editor,
      openAside
        ? "editor.action.revealDefinitionAside"
        : "editor.action.revealDefinition",
      range,
    );
    return;
  }

  try {
    await openLink(filteredLinks[0], openAside);
  } catch (err) {
    // Fallback to moving cursor and running open link command
    await runCommandAtRange(editor, "editor.action.openLink", range);
  }
}

async function runCommandAtRange(
  editor: VscodeTextEditorImpl,
  command: string,
  range: Range,
) {
  await editor.setSelections([range.toSelection(false)], {
    focusEditor: true,
  });
  await vscode.commands.executeCommand(command);
}

async function getLinksForEditor(
  editor: vscode.TextEditor,
): Promise<vscode.DocumentLink[]> {
  return await vscode.commands.executeCommand(
    "vscode.executeLinkProvider",
    editor.document.uri,
  );
}

function openLink(link: vscode.DocumentLink, openAside: boolean) {
  if (link.target == null) {
    throw Error("Document link is missing uri");
  }
  return openUri(link.target, openAside);
}

async function openUri(uri: vscode.Uri, openAside: boolean) {
  switch (uri.scheme) {
    case "http":
    case "https":
      await vscode.env.openExternal(uri);
      break;
    case "file":
      await vscode.window.showTextDocument(
        uri,
        openAside
          ? {
              viewColumn: vscode.ViewColumn.Beside,
            }
          : undefined,
      );
      break;
    default:
      throw Error(`Unknown uri scheme '${uri.scheme}'`);
  }
}
