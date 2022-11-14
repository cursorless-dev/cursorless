import { v4 as uuid } from "uuid";
import * as vscode from "vscode";
import type { Range, Selection } from "../../libs/common/ide";
import type TextDocument from "../../libs/common/ide/types/TextDocument";
import type { TextEditor } from "../../libs/common/ide/types/TextEditor";
import type { TextEditorOptions } from "../../libs/common/ide/types/TextEditorOptions";
import {
  fromVscodeDocument,
  fromVscodeRange,
  fromVscodeSelection,
} from "./VscodeUtil";

export default class VscodeTextEditorImpl implements TextEditor {
  readonly id: string;
  readonly document: TextDocument;

  constructor(protected editor: vscode.TextEditor) {
    this.id = uuid();
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
