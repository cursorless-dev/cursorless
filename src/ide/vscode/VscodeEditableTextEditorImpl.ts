import * as vscode from "vscode";
import type Position from "../../libs/common/ide/Position";
import type Range from "../../libs/common/ide/Range";
import type Selection from "../../libs/common/ide/Selection";
import type { EditableTextEditor } from "../../libs/common/ide/types/TextEditor";
import type { TextEditorDecorationType } from "../../libs/common/ide/types/TextEditorDecorationType";
import type TextEditorEdit from "../../libs/common/ide/types/TextEditorEdit";
import type { TextEditorOptions } from "../../libs/common/ide/types/TextEditorOptions";
import vscodeEditEditor from "./VscodeEditEditor";
import vscodeFocusEditor from "./VscodeFocusEditor";
import vscodeOpenLink from "./VscodeOpenLink";
import VscodeTextEditorImpl from "./VscodeTextEditorImpl";
import {
  toVscodePositionOrRange,
  toVscodeRange,
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
    return vscodeEditEditor(this.editor, callback, options);
  }

  public focus(): Promise<void> {
    return vscodeFocusEditor(this.editor, this.id);
  }

  public openLink(location: Position | Range): Promise<boolean> {
    return vscodeOpenLink(this.editor, toVscodePositionOrRange(location));
  }
}
