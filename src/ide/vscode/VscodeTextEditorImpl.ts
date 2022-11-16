import type {
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorDecorationType,
  TextEditorEdit,
  TextEditorOptions,
} from "@cursorless/common";
import {
  fromVscodeRange,
  fromVscodeSelection,
  toVscodePositionOrRange,
  toVscodeRange,
  toVscodeSelection,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import vscodeEdit from "./VscodeEdit";
import vscodeFocusEditor from "./VscodeFocusEditor";
import VscodeIDE from "./VscodeIDE";
import vscodeOpenLink from "./VscodeOpenLink";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";

export class VscodeTextEditorImpl implements TextEditor {
  readonly document: TextDocument;

  constructor(
    public readonly id: string,
    private ide: VscodeIDE,
    private editor: vscode.TextEditor,
  ) {
    this.document = new VscodeTextDocumentImpl(editor.document);
  }

  get vscodeEditor(): vscode.TextEditor {
    return this.editor;
  }

  get selections(): Selection[] {
    return this.editor.selections.map(fromVscodeSelection);
  }

  set selections(selections: Selection[]) {
    this.editor.selections = selections.map(toVscodeSelection);
  }

  get visibleRanges(): Range[] {
    return this.editor.visibleRanges.map(fromVscodeRange);
  }

  get options(): TextEditorOptions {
    return this.editor.options;
  }

  set options(options: TextEditorOptions) {
    this.editor.options = options;
  }

  get isActive(): boolean {
    return this.editor === vscode.window.activeTextEditor;
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
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
    return vscodeFocusEditor(this.ide, this);
  }

  public openLink(location: Position | Range): Promise<boolean> {
    return vscodeOpenLink(this.editor, toVscodePositionOrRange(location));
  }
}
