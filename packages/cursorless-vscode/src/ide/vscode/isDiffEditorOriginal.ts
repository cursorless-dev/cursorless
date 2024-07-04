import { TextEditor, window } from "vscode";

/**
 * @param editor The editor to check
 * @returns `true` if the editor is the original (left-hand) side of a diff editor
 */
export function isDiffEditorOriginal(editor: TextEditor): boolean {
  if (editor.viewColumn != null) {
    return false;
  }
  const uri = editor.document.uri.toString();
  return window.tabGroups.all.some((tabGroup) =>
    tabGroup.tabs.find((tab: any) => tab.input?.original?.toString() === uri),
  );
}
