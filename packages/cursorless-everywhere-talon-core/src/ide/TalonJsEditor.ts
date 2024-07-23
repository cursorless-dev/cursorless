import type {
  BreakpointDescriptor,
  Edit,
  EditableTextEditor,
  InMemoryTextDocument,
  OpenLinkOptions,
  Range,
  RevealLineAt,
  Selection,
  SetSelectionsOpts,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";
import { selectionsEqual } from "@cursorless/cursorless-engine";
import type { Talon } from "../types/talon.types";
import { setSelections } from "./setSelections";
import type { TalonJsIDE } from "./TalonJsIDE";
import { talonJsPerformEdits } from "./talonJsPerformEdits";

export class TalonJsEditor implements EditableTextEditor {
  options: TextEditorOptions = {
    tabSize: 4,
    insertSpaces: true,
  };

  isActive = true;

  constructor(
    private talon: Talon,
    private ide: TalonJsIDE,
    public id: string,
    public document: InMemoryTextDocument,
    public visibleRanges: Range[],
    public selections: Selection[],
  ) {}

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  async setSelections(
    selections: Selection[],
    _opts?: SetSelectionsOpts,
  ): Promise<void> {
    if (!selectionsEqual(this.selections, selections)) {
      await setSelections(this.talon, this.document, selections);
      this.selections = selections;
    }
  }

  edit(edits: Edit[]): Promise<boolean> {
    talonJsPerformEdits(this.talon, this.ide, this.document, edits);
    return Promise.resolve(true);
  }

  async clipboardCopy(ranges: Range[]): Promise<void> {
    const text = ranges.map((range) => this.document.getText(range)).join("\n");
    this.talon.actions.clip.set_text(text);
  }

  async clipboardPaste(): Promise<void> {
    const text = this.talon.actions.clip.text();
    const edits = this.selections.map((range) => ({
      range,
      text,
      isReplace: true,
    }));
    talonJsPerformEdits(this.talon, this.ide, this.document, edits);
  }

  indentLine(_ranges: Range[]): Promise<void> {
    throw Error(`indentLine not implemented.`);
  }

  outdentLine(_ranges: Range[]): Promise<void> {
    throw Error(`outdentLine not implemented.`);
  }

  insertLineAfter(_ranges?: Range[]): Promise<void> {
    throw Error("insertLineAfter not implemented.");
  }

  focus(): Promise<void> {
    throw new Error("focus not implemented.");
  }

  revealRange(_range: Range): Promise<void> {
    return Promise.resolve();
  }

  revealLine(_lineNumber: number, _at: RevealLineAt): Promise<void> {
    throw new Error("revealLine not implemented.");
  }

  openLink(
    _range: Range,
    _options?: OpenLinkOptions | undefined,
  ): Promise<void> {
    throw new Error("openLink not implemented.");
  }

  fold(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("fold not implemented.");
  }

  unfold(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("unfold not implemented.");
  }

  toggleBreakpoint(
    _descriptors?: BreakpointDescriptor[] | undefined,
  ): Promise<void> {
    throw new Error("toggleBreakpoint not implemented.");
  }

  toggleLineComment(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("toggleLineComment not implemented.");
  }

  insertSnippet(
    _snippet: string,
    _ranges?: Range[] | undefined,
  ): Promise<void> {
    throw new Error("insertSnippet not implemented.");
  }

  rename(_range?: Range | undefined): Promise<void> {
    throw new Error("rename not implemented.");
  }

  showReferences(_range?: Range | undefined): Promise<void> {
    throw new Error("showReferences not implemented.");
  }

  quickFix(_range?: Range | undefined): Promise<void> {
    throw new Error("quickFix not implemented.");
  }

  revealDefinition(_range?: Range | undefined): Promise<void> {
    throw new Error("revealDefinition not implemented.");
  }

  revealTypeDefinition(_range?: Range | undefined): Promise<void> {
    throw new Error("revealTypeDefinition not implemented.");
  }

  showHover(_range?: Range | undefined): Promise<void> {
    throw new Error("showHover not implemented.");
  }

  showDebugHover(_range?: Range | undefined): Promise<void> {
    throw new Error("showDebugHover not implemented.");
  }

  extractVariable(_range?: Range | undefined): Promise<void> {
    throw new Error("extractVariable not implemented.");
  }

  editNewNotebookCellAbove(): Promise<(_selection: Selection) => Selection> {
    throw new Error("editNewNotebookCellAbove not implemented.");
  }

  editNewNotebookCellBelow(): Promise<void> {
    throw new Error("editNewNotebookCellBelow not implemented.");
  }
}
