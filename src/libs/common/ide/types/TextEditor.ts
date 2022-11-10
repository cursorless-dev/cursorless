import Range from "./Range";
import Selection from "./Selection";
import TextDocument from "./TextDocument";

export default interface TextEditor {
  /**
   * The document associated with this text editor. The document will be the same for the entire lifetime of this text editor.
   */
  readonly document: TextDocument;

  /**
   * The selections in this text editor. The primary selection is always at index 0.
   */
  selections: Selection[];

  /**
   * The current visible ranges in the editor (vertically).
   * This accounts only for vertical scrolling, and not for horizontal scrolling.
   */
  readonly visibleRanges: Range[];
}
