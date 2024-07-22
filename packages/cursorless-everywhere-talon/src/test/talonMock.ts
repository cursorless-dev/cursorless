import type {
  EditorChanges,
  EditorState,
  OffsetSelection,
  TalonActions,
  TalonContext,
  TalonContextActions,
} from "@cursorless/cursorless-everywhere-talon-core";
import type { TalonTestHelpers } from "talon";

let _contextActions: TalonContextActions | undefined;
let _editorState: EditorState | undefined;
let _finalEditorState: EditorState | undefined;

export const actions: TalonActions = {
  app: {
    notify(_body: string, _title: string): void {
      console.log(`app.notify: ${_title}: ${_body}`);
    },
  },
  clip: {
    set_text(_text: string): void {
      throw new Error("clip.set_text not implemented.");
    },
    text(): string {
      throw new Error("clip.text not implemented.");
    },
  },
  edit: {
    find(_text?: string): void {
      throw new Error("edit.find not implemented.");
    },
  },
  user: {
    cursorless_everywhere_get_editor_state(): EditorState {
      if (_editorState == null) {
        throw new Error("Editor state not set.");
      }
      return _editorState;
    },
    cursorless_everywhere_set_selections(selections: OffsetSelection[]): void {
      if (_finalEditorState == null) {
        throw new Error("Final editor state not set.");
      }
      _finalEditorState.selections = selections;
    },
    cursorless_everywhere_set_text(changes: EditorChanges): void {
      if (_finalEditorState == null) {
        throw new Error("Final editor state not set.");
      }
      _finalEditorState.text = changes.text;
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
