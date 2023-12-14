import { CodeAction, commands, window } from "vscode";

/**
 * Displays quick actions for the active text editor.
 * @param kind Optional parameter specifying the kind of quick actions to display.
 * @returns A promise that resolves to an array of available code actions.
 */
export async function showQuickActions(kind?: string) {
  const editor = window.activeTextEditor;
  if (editor == null) {
    window.showErrorMessage("No active editor");
    return;
  }

  const availableCodeActions = await commands.executeCommand<CodeAction[]>(
    "vscode.executeCodeActionProvider",
    editor.document.uri,
    editor.selections[0],
    kind,
  );

  availableCodeActions!.forEach((availableCodeAction) => {
    const { title, kind, isPreferred } = availableCodeAction;

    console.log(
      `${JSON.stringify({ title, kind: kind?.value, isPreferred }, null, 4)}`,
    );
  });

  window.showInformationMessage(
    "Run command 'Developer: Toggle Developer Tools' to see available code actions",
  );

  return availableCodeActions;
}
