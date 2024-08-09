import type { EditorEdit, EditorState, SelectionOffsets } from "./types";

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
    cursorless_everywhere_set_selections(selections: SelectionOffsets[]): void;
    cursorless_everywhere_edit_text(edit: EditorEdit): void;
  };
}

export interface TalonContextActions {
  /**
   * Executes an RPC command and waits for the result.
   * This function is useful when the result of the command is needed
   * immediately after execution.
   *
   * @param commandId - The identifier of the command to be executed.
   * @param command - The command object containing necessary parameters.
   * @returns A Promise that resolves with the result of the command execution.
   */
  private_cursorless_talonjs_run_and_wait(
    commandId: string,
    command: unknown,
  ): Promise<void>;
  /**
   * Executes an RPC command without waiting for the result.
   * This function is useful for fire-and-forget operations where
   * the result is not immediately needed.
   *
   * @param commandId - The identifier of the command to be executed.
   * @param command - The command object containing necessary parameters.
   */
  private_cursorless_talonjs_run_no_wait(
    commandId: string,
    command: unknown,
  ): void;
  /**
   * Retrieves the response json from the last RPC command execution.
   *
   * This is useful because TalonJS doesn't have a way to read the responses from promises,
   * but it does wait for them, so we store the response in a global variable and let it be
   * read by this action.
   *
   * @returns The most recent response from an RPC command (JSON stringified).
   */
  private_cursorless_talonjs_get_response_json(): string;
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

interface TalonContextConstructor {
  new (): TalonContext;
}

export interface Talon {
  readonly actions: TalonActions;
  readonly settings: TalonSettings;
  Context: TalonContextConstructor;
}
