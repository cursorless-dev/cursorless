import * as vscode from "vscode";
import Range from "../../libs/common/ide/Range";
import Selection from "../../libs/common/ide/Selection";
import type TextDocument from "../../libs/common/ide/types/TextDocument";
import type TextEditor from "../../libs/common/ide/types/TextEditor";
import VscodeTextDocument from "./VscodeTextDocument";
import { fromVscodeRange, fromVscodeSelection } from "./VscodeUtil";

export default class VscodeTextEditor implements TextEditor {
  readonly document: TextDocument;

  constructor(private editor: vscode.TextEditor) {
    this.document = new VscodeTextDocument(editor.document);
  }

  get selections(): Selection[] {
    return this.editor.selections.map(fromVscodeSelection);
  }

  get visibleRanges(): Range[] {
    return this.editor.visibleRanges.map(fromVscodeRange);
  }
}
