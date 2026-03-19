import type {
  EditorState,
  TalonContextActions,
} from "@cursorless/lib-talon-core";

export interface TalonTestHelpers {
  contextActions: TalonContextActions;
  setEditorState(editorState: EditorState): void;
  getFinalEditorState(): EditorState;
}
