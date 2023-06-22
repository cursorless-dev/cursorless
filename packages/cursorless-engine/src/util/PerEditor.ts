import { Disposable, TextEditor } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";

export class PerEditor<T extends Disposable> {
  private disposables: Disposable[] = [];
  private editorHandlers: Map<string, T> = new Map();

  constructor(private makeEditorHandler: (editor: TextEditor) => T) {
    this.disposables.push(
      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.handleChange),
      // An Event that fires when a text document closes
      ide().onDidCloseTextDocument(this.handleChange),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.handleChange),
    );

    this.handleChange();
  }

  private handleChange() {
    const editors = ide().visibleTextEditors;
    const editorIds = new Set(editors.map((editor) => editor.id));

    for (const [editorId, editorHandler] of this.editorHandlers) {
      if (!editorIds.has(editorId)) {
        editorHandler.dispose();
        this.editorHandlers.delete(editorId);
      }
    }

    for (const editor of editors) {
      if (!this.editorHandlers.has(editor.id)) {
        this.editorHandlers.set(editor.id, this.makeEditorHandler(editor));
      }
    }
  }

  values() {
    return this.editorHandlers.values();
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    for (const editorHandler of this.editorHandlers.values()) {
      editorHandler.dispose();
    }
  }
}
