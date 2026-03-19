import type {
  Edit,
  EditableTextEditor,
  GeneralizedRange,
  InMemoryTextDocument,
  OpenLinkOptions,
  Range,
  RevealLineAt,
  Selection,
  SetSelectionsOpts,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";

export class TestTextEditor implements EditableTextEditor {
  options: TextEditorOptions = {
    tabSize: 4,
    insertSpaces: true,
  };

  isActive = true;

  constructor(
    public id: string,
    public document: InMemoryTextDocument,
    public visibleRanges: Range[],
    public selections: Selection[],
  ) {}

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  async setSelections(
    _selections: Selection[],
    _opts?: SetSelectionsOpts,
  ): Promise<void> {
    throw Error("setSelections: not implemented");
  }

  edit(_edits: Edit[]): Promise<boolean> {
    throw Error("edit: not implemented");
  }

  async clipboardCopy(_ranges: Range[]): Promise<void> {
    throw Error("clipboardCopy: not implemented");
  }

  async clipboardPaste(): Promise<void> {
    throw Error("clipboardPaste: not implemented");
  }

  indentLine(_ranges: Range[]): Promise<void> {
    throw Error("indentLine: not implemented");
  }

  outdentLine(_ranges: Range[]): Promise<void> {
    throw Error("outdentLine: not implemented");
  }

  insertLineAfter(_ranges?: Range[]): Promise<void> {
    throw Error("insertLineAfter: not implemented");
  }

  focus(): Promise<void> {
    throw new Error("focus: not implemented");
  }

  revealRange(_range: Range): Promise<void> {
    return Promise.resolve();
  }

  revealLine(_lineNumber: number, _at: RevealLineAt): Promise<void> {
    throw new Error("revealLine: not implemented");
  }

  openLink(
    _range: Range,
    _options?: OpenLinkOptions | undefined,
  ): Promise<void> {
    throw new Error("openLink: not implemented");
  }

  fold(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("fold: not implemented");
  }

  unfold(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("unfold: not implemented");
  }

  toggleBreakpoint(_ranges?: GeneralizedRange[]): Promise<void> {
    throw new Error("toggleBreakpoint: not implemented");
  }

  toggleLineComment(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("toggleLineComment: not implemented");
  }

  insertSnippet(
    _snippet: string,
    _ranges?: Range[] | undefined,
  ): Promise<void> {
    throw new Error("insertSnippet: not implemented");
  }

  rename(_range?: Range | undefined): Promise<void> {
    throw new Error("rename: not implemented");
  }

  showReferences(_range?: Range | undefined): Promise<void> {
    throw new Error("showReferences: not implemented");
  }

  quickFix(_range?: Range | undefined): Promise<void> {
    throw new Error("quickFix: not implemented");
  }

  revealDefinition(_range?: Range | undefined): Promise<void> {
    throw new Error("revealDefinition: not implemented");
  }

  revealTypeDefinition(_range?: Range | undefined): Promise<void> {
    throw new Error("revealTypeDefinition: not implemented");
  }

  showHover(_range?: Range | undefined): Promise<void> {
    throw new Error("showHover: not implemented");
  }

  showDebugHover(_range?: Range | undefined): Promise<void> {
    throw new Error("showDebugHover: not implemented");
  }

  extractVariable(_range?: Range | undefined): Promise<void> {
    throw new Error("extractVariable: not implemented");
  }

  editNewNotebookCellAbove(): Promise<void> {
    throw new Error("editNewNotebookCellAbove: not implemented");
  }

  editNewNotebookCellBelow(): Promise<void> {
    throw new Error("editNewNotebookCellBelow: not implemented");
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
