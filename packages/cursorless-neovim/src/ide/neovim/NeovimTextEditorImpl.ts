import {
  BreakpointDescriptor,
  EditableTextEditor,
  Position,
  Range,
  RevealLineAt,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  TextEditorOptions,
} from "@cursorless/common";
// import {
//   fromVscodeRange,
//   fromVscodeSelection,
//   toVscodePositionOrRange,
//   toVscodeRange,
//   toVscodeSelection,
// } from "@cursorless/vscode-common";
// import * as vscode from "vscode";
// import vscodeEdit from "./VscodeEdit";
// import vscodeFocusEditor from "./VscodeFocusEditor";
// import { vscodeFold, vscodeUnfold } from "./VscodeFold";
import { NeovimIDE } from "./NeovimIDE";
// import { vscodeInsertSnippet } from "./VscodeInsertSnippets";
// import {
//   vscodeEditNewNotebookCellAbove,
//   vscodeEditNewNotebookCellBelow,
// } from "./VscodeNotebooks";
// import vscodeOpenLink from "./VscodeOpenLink";
// import { vscodeRevealLine } from "./VscodeRevealLine";
import { NeovimTextDocumentImpl } from "./NeovimTextDocumentImpl";
import { Window } from "neovim";

// import { vscodeToggleBreakpoint } from "./VscodeToggleBreakpoint";

export class NeovimTextEditorImpl implements EditableTextEditor {
  // readonly document: TextDocument;
  private _document: TextDocument;

  constructor(
    public readonly id: string,
    private ide: NeovimIDE,
    private editor: Window,
  ) {
    this._document = undefined as unknown as TextDocument; // TODO: update
  }

  public async initialize(): Promise<void> {
    this._document = new NeovimTextDocumentImpl(await this.editor.buffer);
  }

  get document(): TextDocument {
    return this._document;
  }

  // neovim terminology for editor is window
  get neovimEditor(): Window {
    return this.editor;
  }

  get selections(): Selection[] {
    return []; // TODO: update
    // return this.editor.selections;
  }

  set selections(selections: Selection[]) {
    // this.editor.selections = selections.map(toVscodeSelection);
  }

  get visibleRanges(): Range[] {
    return [new Range(0, 0, 10, 0)]; // TODO: update
    // return this.editor.visibleRanges;
  }

  get options(): TextEditorOptions {
    return {}; // TODO: update
    // return this.editor.options;
  }

  set options(options: TextEditorOptions) {
    // this.editor.options = options;
  }

  get isActive(): boolean {
    return false;
    // return this.editor === vscode.window.activeTextEditor;
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  public async revealRange(range: Range): Promise<void> {
    return Promise.resolve();
    // this.editor.revealRange(toVscodeRange(range));
  }

  public revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    return Promise.resolve();
    // return vscodeRevealLine(this, lineNumber, at);
  }

  public edit(
    callback: (editBuilder: TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean },
  ): Promise<boolean> {
    return Promise.resolve(false);
    // return vscodeEdit(this.editor, callback, options);
  }

  public focus(): Promise<void> {
    return Promise.resolve();
    // return vscodeFocusEditor(this.ide, this);
  }

  public editNewNotebookCellAbove(): Promise<
    (selection: Selection) => Selection
  > {
    return Promise.resolve((selection) => selection);
    // return vscodeEditNewNotebookCellAbove(this);
  }

  public editNewNotebookCellBelow(): Promise<void> {
    return Promise.resolve();
    // return vscodeEditNewNotebookCellBelow(this);
  }

  public openLink(location?: Position | Range): Promise<boolean> {
    return Promise.resolve(false);
    // return vscodeOpenLink(
    //   this,
    //   location != null ? toVscodePositionOrRange(location) : undefined,
    // );
  }

  public fold(ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // return vscodeFold(this.ide, this, ranges);
  }

  public unfold(ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // return vscodeUnfold(this.ide, this, ranges);
  }

  public toggleBreakpoint(descriptors?: BreakpointDescriptor[]): Promise<void> {
    return Promise.resolve();
    // return vscodeToggleBreakpoint(this, descriptors);
  }

  public async toggleLineComment(_ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.commentLine");
  }

  public async clipboardCopy(_ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.clipboardCopyAction");
  }

  public async clipboardPaste(_ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // We add these sleeps here to workaround a bug in VSCode. See #1521
    // await sleep(100);
    // await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    // await sleep(100);
  }

  public async indentLine(_ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.indentLines");
  }

  public async outdentLine(_ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.outdentLines");
  }

  public async insertLineAfter(ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // if (ranges != null) {
    //   this.selections = ranges.map((range) => range.toSelection(false));
    // }
    // await this.focus();
    // await vscode.commands.executeCommand("editor.action.insertLineAfter");
  }

  public insertSnippet(snippet: string, ranges?: Range[]): Promise<void> {
    return Promise.resolve();
    // return vscodeInsertSnippet(this, snippet, ranges);
  }

  public async rename(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.rename");
  }

  public async showReferences(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("references-view.find");
  }

  public async quickFix(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.quickFix");
    // await sleep(100);
  }

  public async revealDefinition(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.revealDefinition");
  }

  public async revealTypeDefinition(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.goToTypeDefinition");
  }

  public async showHover(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.action.showHover");
  }

  public async showDebugHover(_range?: Range): Promise<void> {
    return Promise.resolve();
    // await vscode.commands.executeCommand("editor.debug.action.showDebugHover");
  }

  public async extractVariable(_range?: Range): Promise<void> {
    return Promise.resolve();
    // if (this.document.languageId === "python") {
    //   // Workaround for https://github.com/microsoft/vscode-python/issues/20455
    //   await vscode.commands.executeCommand("editor.action.codeAction", {
    //     kind: "refactor.extract",
    //   });
    //   await sleep(250);
    //   await vscode.commands.executeCommand("selectNextCodeAction");
    //   await vscode.commands.executeCommand("acceptSelectedCodeAction");
    // } else {
    //   await vscode.commands.executeCommand("editor.action.codeAction", {
    //     kind: "refactor.extract.constant",
    //     preferred: true,
    //   });
    // }

    // await sleep(250);
  }
}
