import { CodeAction, commands, window } from "vscode";

/**
 * Displays quick actions at the current cursor position in the active text
 * editor.
 * @param kind Optional parameter specifying the kind of quick actions to
 * display. Note that kinds are hierarchical, so if you pass a more generic
 * kind, the more specific sub-kinds will be logged.
 * @returns A promise that resolves to an array of available code actions.
 */
export async function logQuickActions(kind?: string) {
  const editor = window.activeTextEditor;

  if (editor == null) {
    window.showErrorMessage("No active editor");
    return;
  }

  const availableCodeActions = (
    await commands.executeCommand<CodeAction[]>(
      "vscode.executeCodeActionProvider",
      editor.document.uri,
      editor.selections[0],
      kind,
    )
  ).map(({ title, kind, isPreferred }) => ({
    title,
    kind: kind?.value,
    isPreferred,
  }));

  availableCodeActions.forEach((availableCodeAction) => {
    console.log(`${JSON.stringify(availableCodeAction, null, 2)}`);
  });

  window.showInformationMessage(
    "Run command 'Developer: Toggle Developer Tools' to see available code actions",
  );

  return availableCodeActions;
}
