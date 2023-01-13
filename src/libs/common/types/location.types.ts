import { Range } from "./Range";
import { TextEditor } from "./TextEditor";

export interface TextEditorRange {
  editor: TextEditor;
  range: Range;
}
