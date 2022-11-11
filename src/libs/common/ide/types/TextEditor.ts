import type Range from "../Range";
import type Selection from "../Selection";
import type TextDocument from "./TextDocument";
import type TextEditorEdit from "./TextEditorEdit";

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
   * The selections in this text editor. The primary selection is always at index 0.
   */
  readonly selections: Selection[];

  /**
   * Check if this text editor is equal to `other`.
   *
   * @param other A text editor.
   * @return `true` if the this text editor is equal to `other`.
   */
  isEqual(other: TextEditor): boolean;
}

export interface EditableTextEditor extends TextEditor {
  /**
   * The selections in this text editor. The primary selection is always at index 0.
   */
  selections: Selection[];

  /**
   * Scroll to reveal the given range.
   *
   * @param range A range.
   */
  revealRange(range: Range): void;

  /**
   * Focus the editor.
   */
  focus(): Promise<void>;

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
  ): Thenable<boolean>;
}
