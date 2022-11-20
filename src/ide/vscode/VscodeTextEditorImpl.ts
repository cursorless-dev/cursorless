import {
  Position,
  Range,
  RevealLineAt,
  Selection,
  sleep,
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
import { vscodeFold } from "./VscodeFold";
import VscodeIDE from "./VscodeIDE";
import { vscodeInsertSnippet } from "./VscodeInsertSnippets";
import vscodeOpenLink from "./VscodeOpenLink";
import { vscodeRevealLine } from "./VscodeRevealLine";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";
import { vscodeToggleBreakpoint } from "./VscodeToggleBreakpoint";

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

  public async revealRange(range: Range): Promise<void> {
    this.editor.revealRange(toVscodeRange(range));
  }

  public revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    return vscodeRevealLine(this, lineNumber, at);
  }

  public async setDecorations(
    decorationType: TextEditorDecorationType,
    ranges: readonly Range[],
  ): Promise<void> {
    this.editor.setDecorations(decorationType, ranges.map(toVscodeRange));
  }

  public edit(
    callback: (editBuilder: TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean },
  ): Promise<boolean> {
    return vscodeEdit(this.editor, callback, options);
  }

  public focus(): Promise<void> {
    return vscodeFocusEditor(this.ide, this);
  }

  public async executeCommand<T>(
    command: string,
    ...rest: any[]
  ): Promise<T | undefined> {
    return await vscode.commands.executeCommand(command, ...rest);
  }

  public openLink(location?: Position | Range): Promise<boolean> {
    return vscodeOpenLink(
      this.editor,
      location != null ? toVscodePositionOrRange(location) : undefined,
    );
  }

  public fold(lineNumbers?: number[]): Promise<void> {
    return vscodeFold(this.ide, this, lineNumbers, true);
  }

  public unfold(lineNumbers?: number[]): Promise<void> {
    return vscodeFold(this.ide, this, lineNumbers, false);
  }

  public toggleBreakpoint(ranges?: Range[]): Promise<void> {
    return vscodeToggleBreakpoint(this, ranges);
  }

  public async toggleLineComment(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.commentLine");
  }

  public async clipboardCopy(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.clipboardCopyAction");
  }

  public async clipboardPaste(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
  }

  public async indentLines(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.indentLines");
  }

  public async outdentLines(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.outdentLines");
  }

  public async insertLineAfter(ranges?: Range[]): Promise<void> {
    if (ranges != null) {
      this.selections = ranges.map((range) => range.toSelection(false));
    }
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
  }

  public insertSnippet(snippet: string, ranges?: Range[]): Promise<void> {
    return vscodeInsertSnippet(this, snippet, ranges);
  }

  public async rename(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.action.rename");
  }

  public async showReferences(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("references-view.find");
  }

  public async quickFix(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.action.quickFix");
    await sleep(100);
  }

  public async revealDefinition(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.action.revealDefinition");
  }

  public async revealTypeDefinition(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.action.goToTypeDefinition");
  }

  public async showHover(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.action.showHover");
  }

  public async showDebugHover(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.debug.action.showDebugHover");
  }

  public async extractVariable(_range?: Range): Promise<void> {
    await vscode.commands.executeCommand("editor.action.codeAction", {
      kind: "refactor.extract.constant",
      preferred: true,
    });
  }
}
