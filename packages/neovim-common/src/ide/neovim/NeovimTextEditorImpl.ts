import {
  BreakpointDescriptor,
  Edit,
  EditableTextEditor,
  Position,
  Range,
  RevealLineAt,
  Selection,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";
import type { NeovimClient, Window } from "neovim";
import { bufferSetSelections } from "../../neovimApi";
import { neovimClipboardCopy, neovimClipboardPaste } from "../../neovimHelpers";
import neovimEdit from "./NeovimEdit";
import { NeovimIDE } from "./NeovimIDE";
import { NeovimTextDocumentImpl } from "./NeovimTextDocumentImpl";

export class NeovimTextEditorImpl implements EditableTextEditor {
  private _document: NeovimTextDocumentImpl;
  private _selections: Selection[];
  private _visibleRanges: Range[];

  constructor(
    public readonly id: string,
    private client: NeovimClient,
    private neovimIDE: NeovimIDE,
    private window: Window,
    doc: NeovimTextDocumentImpl,
    visibleRanges: Range[],
    selections: Selection[],
  ) {
    this._document = doc;
    this._selections = selections;
    this._visibleRanges = visibleRanges;
  }

  get document(): NeovimTextDocumentImpl {
    return this._document;
  }

  get visibleRanges(): Range[] {
    return this._visibleRanges;
  }

  public updateDocument(
    visibleRanges: Range[],
    selections: Selection[],
    doc?: NeovimTextDocumentImpl,
    lines?: string[],
  ): NeovimTextDocumentImpl {
    if (doc) {
      this._document = doc;
    } else if (lines) {
      this._document.update(lines);
    } else {
      throw Error("updateDocument(): invalid arguments");
    }
    this._selections = selections;
    this._visibleRanges = visibleRanges;
    return this._document;
  }

  get selections(): Selection[] {
    return this._selections as Selection[];
    // throw Error("get selections Not implemented");
  }

  async setSelections(selections: Selection[]): Promise<void> {
    // We assume setting it on the neovim buffer never fails
    // as we cache the selections in the editor beforehand
    this._selections = selections;
    await bufferSetSelections(this.client, selections);
  }

  get options(): TextEditorOptions {
    throw Error("get options Not implemented");
  }

  set options(options: TextEditorOptions) {
    throw Error("set options Not implemented");
  }

  get isActive(): boolean {
    return true;
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  public async revealRange(range: Range): Promise<void> {
    // throw Error("revealRange Not implemented");
  }

  public revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    throw Error("revealLine Not implemented");
  }

  public async edit(edits: Edit[]): Promise<boolean> {
    //throw Error("edit Not implemented");
    return await neovimEdit(this.client, this.neovimIDE, this.window, edits);
  }

  public focus(): Promise<void> {
    return Promise.resolve();
    // throw Error("focus Not implemented");
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
    await neovimClipboardCopy(this.client, this.neovimIDE);
  }

  public async clipboardPaste(_ranges?: Range[]): Promise<void> {
    await neovimClipboardPaste(this.client, this.neovimIDE);
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
