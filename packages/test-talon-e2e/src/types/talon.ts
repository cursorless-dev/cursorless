import type {
  EditorState,
  TalonContextActions,
} from "@cursorless/lib-talonjs-core";

export interface TalonTestHelpers {
  contextActions: TalonContextActions;
  setEditorState(editorState: EditorState): void;
  getFinalEditorState(): EditorState;
}
