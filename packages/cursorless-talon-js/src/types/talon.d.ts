import type { EditorState, OffsetSelection } from "./types";

type Namespace = "user";

interface Actions {
  app: {
    notify(body: string, title: string): void;
  };
  clip: {
    set_text(text: string): void;
    text(): string;
  };
  edit: {
    copy(): void;
    paste(): void;
  };
  user: {
    private_cursorless_run_rpc_command_no_wait(
      commandId: string,
      command: unknown,
    ): void;
    private_cursorless_run_rpc_command_get(
      commandId: string,
      command: unknown,
    ): Promise<unknown>;
    cursorless_js_get_editor_state(): EditorState;
    cursorless_js_set_selection(selection: OffsetSelection): void;
    cursorless_js_set_text(text: string): void;
  };
}

declare module "talon" {
  const actions: Actions;

  class Context {
    matches: string;
    tags: string[];
    settings: Record<string, string | number | boolean>;
    lists: Record<string, Record<string, string> | string[]>;
    action_class(name: Namespace, actions: Partial<Actions[Namespace]>): void;
  }

  const settings: {
    get<T extends string | number | boolean>(
      name: string,
      defaultValue?: T,
    ): T | null;
  };
}
