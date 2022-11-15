import type {
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";
import {
  fromVscodeRange,
  fromVscodeSelection,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { fromVscodeDocument } from "./vscodeIdeUtil";

export class VscodeTextEditorImpl implements TextEditor {
  readonly document: TextDocument;

  constructor(public readonly id: string, protected editor: vscode.TextEditor) {
    this.document = fromVscodeDocument(editor.document);
  }

  get vscodeEditor(): vscode.TextEditor {
    return this.editor;
  }

  get selections(): Selection[] {
    return this.editor.selections.map(fromVscodeSelection);
  }

  get visibleRanges(): Range[] {
    return this.editor.visibleRanges.map(fromVscodeRange);
  }

  get options(): TextEditorOptions {
    return this.editor.options;
  }

  get isActive(): boolean {
    return this.editor === vscode.window.activeTextEditor;
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }
}
