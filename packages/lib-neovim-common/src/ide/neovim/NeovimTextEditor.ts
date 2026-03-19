import type {
  Edit,
  EditableTextEditor,
  GeneralizedRange,
  OpenLinkOptions,
  Range,
  RevealLineAt,
  Selection,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/lib-common";
import type { NeovimClient, Window } from "neovim";
import { bufferSetSelections } from "../../neovimApi";
import { neovimClipboardCopy, neovimClipboardPaste } from "../../neovimHelpers";
import neovimEdit from "./NeovimEdit";
import type { NeovimIDE } from "./NeovimIDE";
import type { NeovimTextDocument } from "./NeovimTextDocument";

export class NeovimTextEditor implements EditableTextEditor {
  private _document: NeovimTextDocument;
  private _selections: Selection[];
  private _visibleRanges: Range[];

  constructor(
    public readonly id: string,
    private client: NeovimClient,
    private neovimIDE: NeovimIDE,
    private window: Window,
    doc: NeovimTextDocument,
    visibleRanges: Range[],
    selections: Selection[],
  ) {
    this._document = doc;
    this._selections = selections;
    this._visibleRanges = visibleRanges;
  }

  get document(): NeovimTextDocument {
    return this._document;
  }

  public updateDocument(
    visibleRanges: Range[],
    selections: Selection[],
    doc?: NeovimTextDocument,
    lines?: string[],
  ): NeovimTextDocument {
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
  }

  async setSelections(selections: Selection[]): Promise<void> {
    // We assume setting it on the neovim buffer never fails
    // as we cache the selections in the editor beforehand
    this._selections = selections;
    await bufferSetSelections(this.client, selections);
  }

  get visibleRanges(): Range[] {
    return this._visibleRanges;
  }

  get options(): TextEditorOptions {
    throw Error("options.get: not implemented");
  }

  set options(options: TextEditorOptions) {
    throw Error("options.set: not implemented");
  }

  get isActive(): boolean {
    return true;
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  public revealRange(_range: Range): Promise<void> {
    return Promise.resolve();
  }

  public revealLine(_lineNumber: number, _at: RevealLineAt): Promise<void> {
    throw Error("revealLine: not implemented");
  }

  public async edit(edits: Edit[]): Promise<boolean> {
    return await neovimEdit(this.client, this.neovimIDE, this.window, edits);
  }

  public focus(): Promise<void> {
    return Promise.resolve();
  }

  public editNewNotebookCellAbove(): Promise<void> {
    throw Error("editNewNotebookCellAbove: not implemented");
  }

  public editNewNotebookCellBelow(): Promise<void> {
    throw Error("editNewNotebookCellBelow: not implemented");
  }

  public openLink(_range: Range, _options?: OpenLinkOptions): Promise<void> {
    throw Error("openLink: not implemented");
  }

  public fold(_ranges?: Range[]): Promise<void> {
    throw Error("fold: not implemented");
  }

  public unfold(_ranges?: Range[]): Promise<void> {
    throw Error("unfold: not implemented");
  }

  public toggleBreakpoint(_ranges?: GeneralizedRange[]): Promise<void> {
    throw Error("toggleBreakpoint: not implemented");
  }

  public async toggleLineComment(_ranges?: Range[]): Promise<void> {
    throw Error("toggleLineComment: not implemented");
  }

  public async clipboardCopy(_ranges?: Range[]): Promise<void> {
    await neovimClipboardCopy(this.client, this.neovimIDE);
  }

  public async clipboardPaste(): Promise<void> {
    await neovimClipboardPaste(this.client, this.neovimIDE);
  }

  public async indentLine(_ranges?: Range[]): Promise<void> {
    throw Error("indentLine: not implemented");
  }

  public async outdentLine(_ranges?: Range[]): Promise<void> {
    throw Error("outdentLine: not implemented");
  }

  public async insertLineAfter(_ranges?: Range[]): Promise<void> {
    throw Error("insertLineAfter: not implemented");
  }

  public insertSnippet(_snippet: string, _ranges?: Range[]): Promise<void> {
    throw Error("insertSnippet: not implemented");
  }

  public async rename(_range?: Range): Promise<void> {
    throw Error("rename: not implemented");
  }

  public async showReferences(_range?: Range): Promise<void> {
    throw Error("showReferences: not implemented");
  }

  public async quickFix(_range?: Range): Promise<void> {
    throw Error("quickFix: not implemented");
  }

  public async revealDefinition(_range?: Range): Promise<void> {
    throw Error("revealDefinition: not implemented");
  }

  public async revealTypeDefinition(_range?: Range): Promise<void> {
    throw Error("revealTypeDefinition: not implemented");
  }

  public async showHover(_range?: Range): Promise<void> {
    throw Error("showHover: not implemented");
  }

  public async showDebugHover(_range?: Range): Promise<void> {
    throw Error("showDebugHover: not implemented");
  }

  public async extractVariable(_range?: Range): Promise<void> {
    throw Error("extractVariable: not implemented");
  }

  public async gitAccept(_range?: Range): Promise<void> {
    throw Error("gitAccept: not implemented");
  }

  public async gitRevert(_range?: Range): Promise<void> {
    throw Error("gitRevert: not implemented");
  }

  public async gitStageFile(): Promise<void> {
    throw Error("gitStageFile: not implemented");
  }

  public async gitUnstageFile(): Promise<void> {
    throw Error("gitUnstageFile: not implemented");
  }

  public async gitStageRange(_range?: Range): Promise<void> {
    throw Error("gitStageRange: not implemented");
  }

  public async gitUnstageRange(_range?: Range): Promise<void> {
    throw Error("gitUnstageRange: not implemented");
  }
}
