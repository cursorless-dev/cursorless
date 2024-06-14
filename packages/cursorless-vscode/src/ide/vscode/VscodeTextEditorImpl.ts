import {
  BreakpointDescriptor,
  Edit,
  EditableTextEditor,
  Position,
  Range,
  RevealLineAt,
  Selection,
  SetSelectionsOpts,
  sleep,
  TextDocument,
  TextEditor,
  TextEditorOptions,
  uniqWithHash,
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
import { vscodeFold, vscodeUnfold } from "./VscodeFold";
import { VscodeIDE } from "./VscodeIDE";
import { vscodeInsertSnippet } from "./VscodeInsertSnippets";
import {
  vscodeEditNewNotebookCellAbove,
  vscodeEditNewNotebookCellBelow,
} from "./VscodeNotebooks";
import vscodeOpenLink from "./VscodeOpenLink";
import { vscodeRevealLine } from "./VscodeRevealLine";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";
import { vscodeToggleBreakpoint } from "./VscodeToggleBreakpoint";

export class VscodeTextEditorImpl implements EditableTextEditor {
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

  async setSelections(
    rawSelections: Selection[],
    { focusEditor = false }: SetSelectionsOpts = {},
  ): Promise<void> {
    const selections = uniqWithHash(
      rawSelections,
      (a, b) => a.isEqual(b),
      (s) => s.concise(),
    ).map(toVscodeSelection);

    if (!focusEditor) {
      this.editor.selections = selections;
      return;
    }

    if (this.isGitDiffEditorOriginal || this.isSearchEditor) {
      // NB: With a git diff editor we focus the editor BEFORE setting the
      // selections because otherwise the selections will be clobbered when we
      // issue the command to switch sides in the diff editor.
      // The search editor has the same problem where focus is moved to the
      // input field and the selection is clobbered.
      await vscodeFocusEditor(this);
      this.editor.selections = selections;
    }
    // Normal text editor
    else {
      // NB: With a normal text editor we focus the editor AFTER setting the
      // selections because otherwise you see an intermediate state where the
      // old selection persists
      this.editor.selections = selections;
      await vscodeFocusEditor(this);
    }
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

  /** Returns true if this is the original/left hand side of a git diff editor */
  get isGitDiffEditorOriginal(): boolean {
    return this.document.uri.scheme === "git";
  }

  /** Returns true if this is a search editor */
  get isSearchEditor(): boolean {
    return this.document.uri.scheme === "search-editor";
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

  public edit(edits: Edit[]): Promise<boolean> {
    return vscodeEdit(this.editor, edits);
  }

  public focus(): Promise<void> {
    return vscodeFocusEditor(this);
  }

  public editNewNotebookCellAbove(): Promise<
    (selection: Selection) => Selection
  > {
    return vscodeEditNewNotebookCellAbove(this);
  }

  public editNewNotebookCellBelow(): Promise<void> {
    return vscodeEditNewNotebookCellBelow(this);
  }

  public openLink(location?: Position | Range): Promise<boolean> {
    return vscodeOpenLink(
      this,
      location != null ? toVscodePositionOrRange(location) : undefined,
    );
  }

  public fold(ranges?: Range[]): Promise<void> {
    return vscodeFold(this.ide, this, ranges);
  }

  public unfold(ranges?: Range[]): Promise<void> {
    return vscodeUnfold(this.ide, this, ranges);
  }

  public toggleBreakpoint(descriptors?: BreakpointDescriptor[]): Promise<void> {
    return vscodeToggleBreakpoint(this, descriptors);
  }

  public async toggleLineComment(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.commentLine");
  }

  public async clipboardCopy(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.clipboardCopyAction");
  }

  public async clipboardPaste(_ranges?: Range[]): Promise<void> {
    // We add these sleeps here to workaround a bug in VSCode. See #1521
    await sleep(100);
    await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    await sleep(100);
  }

  public async indentLine(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.indentLines");
  }

  public async outdentLine(_ranges?: Range[]): Promise<void> {
    await vscode.commands.executeCommand("editor.action.outdentLines");
  }

  public async insertLineAfter(ranges?: Range[]): Promise<void> {
    if (ranges != null) {
      await this.setSelections(ranges.map((range) => range.toSelection(false)));
    }
    await this.focus();
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
    if (this.document.languageId === "python") {
      await vscode.commands.executeCommand("editor.action.codeAction", {
        kind: "refactor.extract.variable",
      });
    } else {
      await vscode.commands.executeCommand("editor.action.codeAction", {
        kind: "refactor.extract.constant",
        preferred: true,
      });
    }

    await sleep(250);
  }
}
