export interface JetbrainsClient {
  clipboardCopy(editorId: string, rangesJson: string): void;
  clipboardPaste(editorId: string): void;
  hatsUpdated(hatsJson: string): void;
  documentUpdated(editorId: string, updateJson: string): void;
  setSelection(editorId: string, selectionJson: string): void;
}
