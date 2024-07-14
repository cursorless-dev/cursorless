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
import { actions } from "talon";
import type { OffsetSelection } from "../types/types";
import type { TalonJsIDE } from "./TalonJsIDE";
import type { TalonJsTextDocument } from "./TalonJsTextDocument";
import { createSelection } from "./createTextEditor";
import { performEdits } from "./performEdits";
import { setSelections } from "./setSelections";

export class TalonJsEditor implements EditableTextEditor {
  options: TextEditorOptions = {
    tabSize: 4,
    insertSpaces: true,
  };

  isActive = true;

  constructor(
    private ide: TalonJsIDE,
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
    _opts?: SetSelectionsOpts | undefined,
  ): Promise<void> {
    return setSelections(this.document, selections);
  }

  setSelectionInternal(selection: OffsetSelection): void {
    this.selections = [createSelection(this.document, selection)];
  }

  edit(edits: Edit[]): Promise<boolean> {
    return performEdits(this.ide, this, edits);
  }

  insertLineAfter(_ranges?: Range[] | undefined): Promise<void> {
    actions.edit.line_insert_down();
    return Promise.resolve();
  }

  focus(): Promise<void> {
    throw new Error("focus not implemented.");
  }

  revealRange(_range: Range): Promise<void> {
    throw new Error("revealRange not implemented.");
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

  clipboardCopy(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("clipboardCopy not implemented.");
  }

  clipboardPaste(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("clipboardPaste not implemented.");
  }

  toggleBreakpoint(
    _descriptors?: BreakpointDescriptor[] | undefined,
  ): Promise<void> {
    throw new Error("toggleBreakpoint not implemented.");
  }

  toggleLineComment(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("toggleLineComment not implemented.");
  }

  indentLine(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("indentLine not implemented.");
  }

  outdentLine(_ranges?: Range[] | undefined): Promise<void> {
    throw new Error("outdentLine not implemented.");
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
