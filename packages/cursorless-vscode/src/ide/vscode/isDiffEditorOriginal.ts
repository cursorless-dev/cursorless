import { TextEditor, window } from "vscode";


export function isDiffEditorOriginal(editor: TextEditor): boolean {
  if (editor.viewColumn != null) {
    return false;
  }
  const uri = editor.document.uri.toString();
  return window.tabGroups.all.some((tabGroup) => tabGroup.tabs.find((tab: any) => tab.input.original?.toString() === uri)
  );
}
