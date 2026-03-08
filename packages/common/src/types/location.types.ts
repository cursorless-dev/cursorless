import type { Range } from "./Range";
import type { TextEditor } from "./TextEditor";

export interface TextEditorRange {
  editor: TextEditor;
  range: Range;
}
