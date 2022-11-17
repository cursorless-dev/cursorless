import type {
  Position,
  Range,
  RevealLineAt,
  Selection,
  TextDocument,
  TextEditorDecorationType,
  TextEditorEdit,
  TextEditorOptions,
} from "@cursorless/common";

/**
 * Represents a read-only reference to a text editor.  If you need to modify the
 * editor, use {@link IDE.getEditableTextEditor}.
 */
export interface TextEditor {
  /**
   * Unique identifier for this text editor
   */
  readonly id: string;

  /**
   * The document associated with this text editor. The document will be the same for the entire lifetime of this text editor.
   */
  readonly document: TextDocument;

  /**
   * The current visible ranges in the editor (vertically).
   * This accounts only for vertical scrolling, and not for horizontal scrolling.
   */
  readonly visibleRanges: Range[];

  /**
   * The selections in this text editor.
   */
  readonly selections: Selection[];

  /**
   * Text editor options.
   */
  readonly options: TextEditorOptions;

  /**
   * True if this text editor is active.
   */
  readonly isActive: boolean;

  /**
   * Check if this text editor is equal to `other`.
   *
   * @param other A text editor.
   * @return `true` if the this text editor is equal to `other`.
   */
  isEqual(other: TextEditor): boolean;
}

export interface EditableTextEditor extends TextEditor {
  selections: Selection[];

  options: TextEditorOptions;

  /**
   * Scroll to reveal the given range.
   *
   * @param range A range.
   */
  revealRange(range: Range): Promise<void>;

  /**
   * Scroll to reveal the given line.
   *
   * @param lineNumber A line number.
   * @param at Were to reveal the line at: top|center|bottom.
   */
  revealLine(lineNumber: number, at: RevealLineAt): Promise<void>;

  /**
   * Focus the editor.
   */
  focus(): Promise<void>;

  /**
   * Adds a set of decorations to the text editor. If a set of decorations already exists with
   * the given {@link TextEditorDecorationType decoration type}, they will be replaced. If
   * `ranges` is empty, the existing decorations with the given {@link TextEditorDecorationType decoration type}
   * will be removed.
   *
   * @param decorationType A decoration type.
   * @param ranges  {@link Range ranges}
   */
  setDecorations(
    decorationType: TextEditorDecorationType,
    ranges: readonly Range[],
  ): Promise<void>;

  /**
   * Perform an edit on the document associated with this text editor.
   *
   * The given callback-function is invoked with an {@link TextEditorEdit edit-builder} which must
   * be used to make edits. Note that the edit-builder is only valid while the
   * callback executes.
   *
   * @param callback A function which can create edits using an {@link TextEditorEdit edit-builder}.
   * @param options The undo/redo behavior around this edit. By default, undo stops will be created before and after this edit.
   * @return A promise that resolves with a value indicating if the edits could be applied.
   */
  edit(
    callback: (editBuilder: TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean },
  ): Promise<boolean>;

  /**
   * Open link at location.
   * @param location Position or range
   * @return True if a link was opened
   */
  openLink(location: Position | Range): Promise<boolean>;

  /**
   * Paste clipboard content
   */
  clipboardPaste(): Promise<void>;

  /**
   * Fold lines
   * @param lineNumbers Lines to fold
   */
  fold(lineNumbers: number[]): Promise<void>;

  /**
   * Unfold lines
   * @param lineNumbers Lines to Unfold
   */
  unfold(lineNumbers: number[]): Promise<void>;

  /**
   * Insert snippet
   * @param snippet A snippet string
   */
  insertSnippet(snippet: string): Promise<void>;
}
