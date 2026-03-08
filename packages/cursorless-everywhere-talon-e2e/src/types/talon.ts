import type {
  EditorState,
  TalonContextActions,
} from "@cursorless/cursorless-everywhere-talon-core";

export interface TalonTestHelpers {
  contextActions: TalonContextActions;
  setEditorState(editorState: EditorState): void;
  getFinalEditorState(): EditorState;
}
