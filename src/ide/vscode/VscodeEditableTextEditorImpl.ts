import type {
  EditableTextEditor,
  Position,
  Range,
  Selection,
  TextEditorDecorationType,
  TextEditorEdit,
  TextEditorOptions,
} from "@cursorless/common";
import {
  ParseTreeApi,
  toVscodePositionOrRange,
  toVscodeRange,
  toVscodeSelection,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import vscodeFocusEditor from "../../ide/vscode/VscodeFocusEditor";
import vscodeEdit from "./VscodeEdit";
import vscodeOpenLink from "./VscodeOpenLink";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export class VscodeEditableTextEditorImpl
  extends VscodeTextEditorImpl
  implements EditableTextEditor
{
  constructor(parseTreeApi: ParseTreeApi, editor: vscode.TextEditor) {
    super(parseTreeApi, editor);
  }

  get selections(): Selection[] {
    return super.selections;
  }

  set selections(selections: Selection[]) {
    this.editor.selections = selections.map(toVscodeSelection);
  }

  get options(): TextEditorOptions {
    return super.options;
  }

  set options(options: TextEditorOptions) {
    this.editor.options = options;
  }

  public revealRange(range: Range): void {
    this.editor.revealRange(toVscodeRange(range));
  }

  public setDecorations(
    decorationType: TextEditorDecorationType,
    ranges: readonly Range[],
  ): void {
    this.editor.setDecorations(decorationType, ranges.map(toVscodeRange));
  }

  public edit(
    callback: (editBuilder: TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean },
  ): Thenable<boolean> {
    return vscodeEdit(this.editor, callback, options);
  }

  public focus(): Promise<void> {
    return vscodeFocusEditor(this.editor);
  }

  public openLink(location: Position | Range): Promise<boolean> {
    return vscodeOpenLink(this.editor, toVscodePositionOrRange(location));
  }
}
