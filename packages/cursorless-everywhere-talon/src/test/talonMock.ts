import type {
  TalonActions,
  TalonContext,
  TalonContextActions,
  TalonTestHelpers,
} from "../types/talon";
import type { EditorState, OffsetSelection } from "../types/types";

let _contextActions: TalonContextActions | undefined;
let _editorState: EditorState | undefined;
let _finalEditorState: EditorState | undefined;

export const actions: TalonActions = {
  app: {
    notify: function (_body: string, _title: string): void {
      console.log(`app.notify: ${_title}: ${_body}`);
    },
  },
  clip: {
    set_text: function (_text: string): void {
      throw new Error("clip.set_text not implemented.");
    },
    text: function (): string {
      throw new Error("clip.text not implemented.");
    },
  },
  edit: {
    find: function (_text?: string): void {
      throw new Error("edit.find not implemented.");
    },
  },
  user: {
    cursorless_everywhere_get_editor_state: function (): EditorState {
      if (_editorState == null) {
        throw new Error("Editor state not set.");
      }
      return _editorState;
    },
    cursorless_everywhere_set_selection: function (
      selection: OffsetSelection,
    ): void {
      if (_finalEditorState == null) {
        throw new Error("Final editor state not set.");
      }
      _finalEditorState.selections = [selection];
    },
    cursorless_everywhere_set_text: function (text: string): void {
      if (_finalEditorState == null) {
        throw new Error("Final editor state not set.");
      }
      _finalEditorState.text = text;
    },
  },
};

export class Context implements TalonContext {
  matches = "";
  tags = [];
  settings = {};
  lists = {};

  action_class(name: "user", actions: TalonContextActions): void {
    _contextActions = actions;
  }
}

export function getTestHelpers(): TalonTestHelpers {
  if (_contextActions == null) {
    throw new Error("Context actions not set.");
  }
  return {
    contextActions: _contextActions,
    setEditorState(editorState: EditorState) {
      _editorState = editorState;
      _finalEditorState = editorState;
    },
    getFinalEditorState(): EditorState {
      if (_finalEditorState == null) {
        throw new Error("Final editor state not set.");
      }
      return _finalEditorState;
    },
  };
}
