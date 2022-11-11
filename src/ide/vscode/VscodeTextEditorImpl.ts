import { v4 as uuid } from "uuid";
import * as vscode from "vscode";
import type Range from "../../libs/common/ide/Range";
import type Selection from "../../libs/common/ide/Selection";
import type TextDocument from "../../libs/common/ide/types/TextDocument";
import type { TextEditor } from "../../libs/common/ide/types/TextEditor";
import VscodeTextDocumentImpl from "./VscodeTextDocumentImpl";
import { fromVscodeRange, fromVscodeSelection } from "./VscodeUtil";

export default class VscodeTextEditorImpl implements TextEditor {
  readonly id: string;
  readonly document: TextDocument;

  constructor(public editor: vscode.TextEditor) {
    this.id = uuid();
    this.document = new VscodeTextDocumentImpl(editor.document);
  }

  get selections(): Selection[] {
    return this.editor.selections.map(fromVscodeSelection);
  }

  get visibleRanges(): Range[] {
    return this.editor.visibleRanges.map(fromVscodeRange);
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }
}
