/**
 * A token within a text editor
 */
import { Range } from "./Range";
import { RangeOffsets } from "./RangeOffsets";
import { TextEditor } from "./TextEditor";

/**
 * A token within a text editor
 */
export interface Token {
  editor: TextEditor;
  range: Range;
  offsets: RangeOffsets;
  text: string;
}
