/**
 * A token within a text editor
 */
import type { Range, RangeOffsets } from "./Range";
import type { TextEditor } from "./TextEditor";

/**
 * A token within a text editor
 */
export interface Token {
  editor: TextEditor;
  range: Range;
  offsets: RangeOffsets;
  text: string;
}
