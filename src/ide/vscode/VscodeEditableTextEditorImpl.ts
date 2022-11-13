import * as vscode from "vscode";
import type Position from "../../libs/common/ide/Position";
import type Range from "../../libs/common/ide/Range";
import type Selection from "../../libs/common/ide/Selection";
import type { EndOfLine } from "../../libs/common/ide/types/ide.types";
import type { EditableTextEditor } from "../../libs/common/ide/types/TextEditor";
import { TextEditorDecorationType } from "../../libs/common/ide/types/TextEditorDecorationType";
import type TextEditorEdit from "../../libs/common/ide/types/TextEditorEdit";
import focusVscodeEditor from "./VscodeFocusEditor";
import vscodeOpenLink from "./VscodeOpenLink";
import VscodeTextEditorImpl from "./VscodeTextEditorImpl";
import {
  toVscodeEndOfLine,
  toVscodePosition,
  toVscodeRange,
  toVscodePositionOrRange,
  toVscodeSelection,
} from "./VscodeUtil";

export default class VscodeEditableTextEditorImpl
  extends VscodeTextEditorImpl
  implements EditableTextEditor
{
  constructor(editor: vscode.TextEditor) {
    super(editor);
  }

  set selections(selections: Selection[]) {
    this.editor.selections = selections.map(toVscodeSelection);
  }

  public revealRange(range: Range): void {
    this.editor.revealRange(toVscodeRange(range));
  }

  public focus(): Promise<void> {
    return focusVscodeEditor(this.editor, this.id);
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
    return this.editor.edit((editBuilder) => {
      callback({
        replace: (location, value) => {
          editBuilder.replace(toVscodePositionOrRange(location), value);
        },
        insert: (location: Position, value: string) => {
          editBuilder.insert(toVscodePosition(location), value);
        },
        delete: (location: Range | Selection) => {
          return editBuilder.delete(toVscodeRange(location));
        },
        setEndOfLine: (endOfLine: EndOfLine) => {
          return editBuilder.setEndOfLine(toVscodeEndOfLine(endOfLine));
        },
      });
    }, options);
  }

  public openLink(location: Position | Range): Promise<boolean> {
    return vscodeOpenLink(this.editor, toVscodePositionOrRange(location));
  }
}
