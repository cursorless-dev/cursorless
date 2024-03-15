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
import { NeovimIDE } from "./NeovimIDE";
import { Window } from "neovim";
import { InMemoryTextDocumentImpl } from "./InMemoryTextDocumentImpl";
import { URI } from "vscode-uri";

export class InMemoryTextEditorImpl implements EditableTextEditor {
  readonly document: TextDocument;

  constructor(
    public readonly id: string,
    private ide: NeovimIDE,
    private editor: Window,
    bufferId: number,
    lines: string[],
    public visibleRanges: Range[],
  ) {
    // TODO: don't hardcode arguments
    this.document = new InMemoryTextDocumentImpl(
      URI.parse(`neovim://${bufferId}`), // URI.parse(`file://${bufferId}`),
      "plaintext",
      1,
      "\n",
      lines,
    );
  }

  // neovim terminology for editor is window
  get neovimEditor(): Window {
    return this.editor;
  }

  get selections(): Selection[] {
    throw Error("get selections Not implemented");
  }

  set selections(selections: Selection[]) {
    throw Error("set selections Not implemented");
  }

  get options(): TextEditorOptions {
    throw Error("get options Not implemented");
  }

  set options(options: TextEditorOptions) {
    throw Error("set options Not implemented");
  }

  get isActive(): boolean {
    throw Error("isActive Not implemented");
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  public async revealRange(range: Range): Promise<void> {
    throw Error("revealRange Not implemented");
  }

  public revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    throw Error("revealLine Not implemented");
  }

  public edit(
    callback: (editBuilder: TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean },
  ): Promise<boolean> {
    throw Error("edit Not implemented");
  }

  public focus(): Promise<void> {
    throw Error("focus Not implemented");
  }

  public editNewNotebookCellAbove(): Promise<
    (selection: Selection) => Selection
  > {
    throw Error("editNewNotebookCellAbove Not implemented");
  }

  public editNewNotebookCellBelow(): Promise<void> {
    throw Error("editNewNotebookCellBelow Not implemented");
  }

  public openLink(location?: Position | Range): Promise<boolean> {
    throw Error("openLink Not implemented");
  }

  public fold(ranges?: Range[]): Promise<void> {
    throw Error("fold Not implemented");
  }

  public unfold(ranges?: Range[]): Promise<void> {
    throw Error("unfold Not implemented");
  }

  public toggleBreakpoint(descriptors?: BreakpointDescriptor[]): Promise<void> {
    throw Error("toggleBreakpoint Not implemented");
  }

  public async toggleLineComment(_ranges?: Range[]): Promise<void> {
    throw Error("toggleLineComment Not implemented");
  }

  public async clipboardCopy(_ranges?: Range[]): Promise<void> {
    throw Error("clipboardCopy Not implemented");
  }

  public async clipboardPaste(_ranges?: Range[]): Promise<void> {
    throw Error("clipboardPaste Not implemented");
  }

  public async indentLine(_ranges?: Range[]): Promise<void> {
    throw Error("indentLine Not implemented");
  }

  public async outdentLine(_ranges?: Range[]): Promise<void> {
    throw Error("outdentLine Not implemented");
  }

  public async insertLineAfter(ranges?: Range[]): Promise<void> {
    throw Error("insertLineAfter Not implemented");
  }

  public insertSnippet(snippet: string, ranges?: Range[]): Promise<void> {
    throw Error("insertSnippet Not implemented");
  }

  public async rename(_range?: Range): Promise<void> {
    throw Error("rename Not implemented");
  }

  public async showReferences(_range?: Range): Promise<void> {
    throw Error("showReferences Not implemented");
  }

  public async quickFix(_range?: Range): Promise<void> {
    throw Error("quickFix Not implemented");
  }

  public async revealDefinition(_range?: Range): Promise<void> {
    throw Error("revealDefinition Not implemented");
  }

  public async revealTypeDefinition(_range?: Range): Promise<void> {
    throw Error("revealTypeDefinition Not implemented");
  }

  public async showHover(_range?: Range): Promise<void> {
    throw Error("showHover Not implemented");
  }

  public async showDebugHover(_range?: Range): Promise<void> {
    throw Error("showDebugHover Not implemented");
  }

  public async extractVariable(_range?: Range): Promise<void> {
    throw Error("extractVariable Not implemented");
  }
}
