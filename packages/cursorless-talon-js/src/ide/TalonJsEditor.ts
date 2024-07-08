import type {
  BreakpointDescriptor,
  Edit,
  EditableTextEditor,
  OpenLinkOptions,
  Range,
  RevealLineAt,
  Selection,
  SetSelectionsOpts,
  TextDocument,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";

export class TalonJsEditor implements EditableTextEditor {
  options: TextEditorOptions = {
    tabSize: 4,
    insertSpaces: true,
  };

  isActive = true;
  id: string;
  document: TextDocument;
  visibleRanges: Range[];
  selections: Selection[];

  constructor(text: string, anchorOffset: number, activeOffset: number) {}

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  setSelections(
    selections: Selection[],
    opts?: SetSelectionsOpts | undefined,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  revealRange(range: Range): Promise<void> {
    throw new Error("Method not implemented.");
  }

  revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    throw new Error("Method not implemented.");
  }

  focus(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  edit(edits: Edit[]): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  editNewNotebookCellAbove(): Promise<(selection: Selection) => Selection> {
    throw new Error("Method not implemented.");
  }

  editNewNotebookCellBelow(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  openLink(range: Range, options?: OpenLinkOptions | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  fold(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unfold(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  clipboardCopy(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  clipboardPaste(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  toggleBreakpoint(
    descriptors?: BreakpointDescriptor[] | undefined,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  toggleLineComment(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  indentLine(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  outdentLine(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  insertLineAfter(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  insertSnippet(snippet: string, ranges?: Range[] | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  rename(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  showReferences(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  quickFix(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  revealDefinition(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  revealTypeDefinition(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  showHover(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  showDebugHover(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }

  extractVariable(range?: Range | undefined): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
