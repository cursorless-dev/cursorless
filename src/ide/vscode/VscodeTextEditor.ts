import * as vscode from "vscode";
import type IRange from "../../libs/common/ide/types/Range";
import type ISelection from "../../libs/common/ide/types/Selection";
import type TextDocument from "../../libs/common/ide/types/TextDocument";
import type TextEditor from "../../libs/common/ide/types/TextEditor";
import Range from "../Range";
import Selection from "../Selection";
import VscodeTextDocument from "./VscodeTextDocument";

export default class VscodeTextEditor implements TextEditor {
  readonly document: TextDocument;

  constructor(private editor: vscode.TextEditor) {
    this.document = new VscodeTextDocument(editor.document);
  }

  get selections(): ISelection[] {
    return this.editor.selections.map((s) => new Selection(s.anchor, s.active));
  }

  get visibleRanges(): IRange[] {
    return this.editor.visibleRanges.map((r) => new Range(r.start, r.end));
  }
}
