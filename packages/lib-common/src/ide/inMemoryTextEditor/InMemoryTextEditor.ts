import type {
  Edit,
  EditableTextEditor,
  EmittableIDE,
  GeneralizedRange,
  OpenLinkOptions,
  Range,
  RevealLineAt,
  SelectionOffsets,
  SetSelectionsOpts,
  TextDocument,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/lib-common";
import { Selection, selectionsEqual } from "@cursorless/lib-common";
import { URI } from "vscode-uri";
import { InMemoryTextDocument } from "./InMemoryTextDocument";

interface Params {
  ide: EmittableIDE;
  languageId?: string;
  content?: string;
  options?: TextEditorOptions;
  visibleRanges?: Range[];
  selections?: Selection[] | SelectionOffsets[];
}

export class InMemoryTextEditor implements EditableTextEditor {
  private static nextId = 0;

  private readonly ide: EmittableIDE;
  readonly id: string;
  readonly isActive = true;
  readonly document: InMemoryTextDocument;
  readonly options: TextEditorOptions;
  readonly visibleRanges: Range[];
  selections: Selection[];

  constructor({
    ide,
    languageId = "plaintext",
    content = "",
    visibleRanges,
    selections,
    options,
  }: Params) {
    this.ide = ide;
    this.id = String(InMemoryTextEditor.nextId++);
    const uri = URI.parse(`InMemoryTextEditor://${this.id}`);
    this.document = new InMemoryTextDocument(uri, languageId, content);

    if (visibleRanges != null) {
      if (visibleRanges.length === 0) {
        throw new Error("Visible ranges must be non-empty");
      }
      this.visibleRanges = visibleRanges;
    } else {
      this.visibleRanges = [this.document.range];
    }

    if (selections != null) {
      if (selections.length === 0) {
        throw new Error("Selections must be non-empty");
      }
      this.selections = selections.map((s) => {
        return s instanceof Selection ? s : createSelection(this.document, s);
      });
    } else {
      this.selections = [new Selection(0, 0, 0, 0)];
    }

    this.options = options ?? {
      insertSpaces: true,
      tabSize: 4,
    };
  }

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  async setSelections(
    selections: Selection[],
    _opts?: SetSelectionsOpts,
  ): Promise<void> {
    if (selections.length === 0) {
      throw new Error("Selections must be non-empty");
    }
    if (!selectionsEqual(this.selections, selections)) {
      this.selections = selections;
      this.ide.emitDidChangeTextEditorSelection({
        textEditor: this,
        selections: selections,
      });
    }
  }

  edit(edits: Edit[]): Promise<boolean> {
    const changes = this.document.edit(edits);
    this.ide.emitDidChangeTextDocument({
      document: this.document,
      contentChanges: changes,
    });
    return Promise.resolve(true);
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

  openLink(_range: Range, _options?: OpenLinkOptions): Promise<void> {
    throw new Error("openLink: not implemented");
  }

  fold(_ranges?: Range[]): Promise<void> {
    throw new Error("fold: not implemented");
  }

  unfold(_ranges?: Range[]): Promise<void> {
    throw new Error("unfold: not implemented");
  }

  toggleBreakpoint(_ranges?: GeneralizedRange[]): Promise<void> {
    throw new Error("toggleBreakpoint: not implemented");
  }

  toggleLineComment(_ranges?: Range[]): Promise<void> {
    throw new Error("toggleLineComment: not implemented");
  }

  insertSnippet(_snippet: string, _ranges?: Range[]): Promise<void> {
    throw new Error("insertSnippet: not implemented");
  }

  rename(_range?: Range): Promise<void> {
    throw new Error("rename: not implemented");
  }

  showReferences(_range?: Range): Promise<void> {
    throw new Error("showReferences: not implemented");
  }

  quickFix(_range?: Range): Promise<void> {
    throw new Error("quickFix: not implemented");
  }

  revealDefinition(_range?: Range): Promise<void> {
    throw new Error("revealDefinition: not implemented");
  }

  revealTypeDefinition(_range?: Range): Promise<void> {
    throw new Error("revealTypeDefinition: not implemented");
  }

  showHover(_range?: Range): Promise<void> {
    throw new Error("showHover: not implemented");
  }

  showDebugHover(_range?: Range): Promise<void> {
    throw new Error("showDebugHover: not implemented");
  }

  extractVariable(_range?: Range): Promise<void> {
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

function createSelection(document: TextDocument, selection: SelectionOffsets) {
  return new Selection(
    document.positionAt(selection.anchor),
    document.positionAt(selection.active),
  );
}
