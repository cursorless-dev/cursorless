import type { EditorState, OffsetSelection } from "./types";

export type TalonNamespace = "user";

export interface TalonActions {
  app: {
    notify(body: string, title: string): void;
  };
  clip: {
    set_text(text: string): void;
    text(): string;
  };
  edit: {
    find(text?: string): void;
  };
  user: {
    cursorless_everywhere_get_editor_state(): EditorState;
    cursorless_everywhere_set_selection(selection: OffsetSelection): void;
    cursorless_everywhere_set_text(text: string): void;
  };
}

export interface TalonContextActions {
  private_cursorless_run_rpc_command_no_wait(
    commandId: string,
    command: unknown,
  ): void;
  private_cursorless_run_rpc_command_get(
    commandId: string,
    command: unknown,
  ): Promise<unknown>;
}

export interface TalonContext {
  matches: string;
  tags: string[];
  settings: Record<string, string | number | boolean>;
  lists: Record<string, Record<string, string> | string[]>;
  action_class(name: "user", actions: TalonContextActions): void;
}

export interface TalonSettings {
  get<T extends string | number | boolean>(
    name: string,
    defaultValue?: T,
  ): T | null;
}

export interface TalonTestHelpers {
  contextActions: TalonContextActions;
  setEditorState(editorState: EditorState): void;
  getFinalEditorState(): EditorState;
}

declare module "talon" {
  const actions: TalonActions;
  const settings: TalonSettings;

  class Context implements TalonContext {
    matches: string;
    tags: string[];
    settings: Record<string, string | number | boolean>;
    lists: Record<string, Record<string, string> | string[]>;
    action_class(name: "user", actions: TalonContextActions): void;
  }

  const getTestHelpers: () => TalonTestHelpers;
}
