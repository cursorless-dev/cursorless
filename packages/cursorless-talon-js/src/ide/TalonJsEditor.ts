import type {
  BreakpointDescriptor,
  Edit,
  EditableTextEditor,
  OpenLinkOptions,
  Range,
  RevealLineAt,
  Selection,
  SetSelectionsOpts,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";
import type { TalonJsTextDocument } from "./TalonJsTextDocument";

export class TalonJsEditor implements EditableTextEditor {
  options: TextEditorOptions = {
    tabSize: 4,
    insertSpaces: true,
  };

  isActive = true;

  constructor(
    public id: string,
    public document: TalonJsTextDocument,
    public visibleRanges: Range[],
    public selections: Selection[],
  ) {}

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  setSelections(
    selections: Selection[],
    opts?: SetSelectionsOpts | undefined,
  ): Promise<void> {
    throw new Error("setSelections not implemented.");
  }

  revealRange(range: Range): Promise<void> {
    throw new Error("revealRange not implemented.");
  }

  revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    throw new Error("revealLine not implemented.");
  }

  focus(): Promise<void> {
    throw new Error("focus not implemented.");
  }

  edit(edits: Edit[]): Promise<boolean> {
    throw new Error("edit not implemented.");
  }

  editNewNotebookCellAbove(): Promise<(selection: Selection) => Selection> {
    throw new Error("editNewNotebookCellAbove not implemented.");
  }

  editNewNotebookCellBelow(): Promise<void> {
    throw new Error("editNewNotebookCellBelow not implemented.");
  }

  openLink(range: Range, options?: OpenLinkOptions | undefined): Promise<void> {
    throw new Error("openLink not implemented.");
  }

  fold(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("fold not implemented.");
  }

  unfold(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("unfold not implemented.");
  }

  clipboardCopy(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("clipboardCopy not implemented.");
  }

  clipboardPaste(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("clipboardPaste not implemented.");
  }

  toggleBreakpoint(
    descriptors?: BreakpointDescriptor[] | undefined,
  ): Promise<void> {
    throw new Error("toggleBreakpoint not implemented.");
  }

  toggleLineComment(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("toggleLineComment not implemented.");
  }

  indentLine(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("indentLine not implemented.");
  }

  outdentLine(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("outdentLine not implemented.");
  }

  insertLineAfter(ranges?: Range[] | undefined): Promise<void> {
    throw new Error("insertLineAfter not implemented.");
  }

  insertSnippet(snippet: string, ranges?: Range[] | undefined): Promise<void> {
    throw new Error("insertSnippet not implemented.");
  }

  rename(range?: Range | undefined): Promise<void> {
    throw new Error("rename not implemented.");
  }

  showReferences(range?: Range | undefined): Promise<void> {
    throw new Error("showReferences not implemented.");
  }

  quickFix(range?: Range | undefined): Promise<void> {
    throw new Error("quickFix not implemented.");
  }

  revealDefinition(range?: Range | undefined): Promise<void> {
    throw new Error("revealDefinition not implemented.");
  }

  revealTypeDefinition(range?: Range | undefined): Promise<void> {
    throw new Error("revealTypeDefinition not implemented.");
  }

  showHover(range?: Range | undefined): Promise<void> {
    throw new Error("showHover not implemented.");
  }

  showDebugHover(range?: Range | undefined): Promise<void> {
    throw new Error("showDebugHover not implemented.");
  }

  extractVariable(range?: Range | undefined): Promise<void> {
    throw new Error("extractVariable not implemented.");
  }
}
