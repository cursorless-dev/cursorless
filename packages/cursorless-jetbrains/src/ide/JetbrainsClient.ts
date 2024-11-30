export interface JetbrainsClient {
  hatsUpdated(hatsJson: string): void;
  documentUpdated(editorId: string, updateJson: string): void;
  setSelection(editorId: string, selectionJson: string): void;
}
