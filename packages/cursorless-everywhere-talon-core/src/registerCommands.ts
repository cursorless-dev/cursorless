import { CURSORLESS_COMMAND_ID, type HatTokenMap } from "@cursorless/common";
import type { CommandApi } from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "./ide/TalonJsIDE";
import type { Talon } from "./types/talon.types";
import type { EditorState } from "./types/types";

export function registerCommands(
  talon: Talon,
  ide: TalonJsIDE,
  commandApi: CommandApi,
  hatTokenMap: HatTokenMap,
) {
  const ctx = new talon.Context();
  ctx.matches = "tag: user.cursorless_everywhere_talon";

  let lastCommandResponse: unknown = null;

  ctx.action_class("user", {
    async private_cursorless_talonjs_run_and_wait(
      commandId: string,
      command: unknown,
    ): Promise<void> {
      lastCommandResponse = await runCommand(commandId, command);
    },

    private_cursorless_talonjs_run_no_wait(
      commandId: string,
      command: unknown,
    ): void {
      void runCommand(commandId, command);
      lastCommandResponse = null;
    },

    private_cursorless_talonjs_get_response_json(): string {
      // Talon JS doesn't convert JS objects to Python objects, and also doesn't provide
      // a way to inspect types, so just serialize the response to JSON
      return JSON.stringify(lastCommandResponse);
    },
  });

  async function runCommand(
    commandId: string,
    command: unknown,
  ): Promise<unknown> {
    try {
      // Hat reallocation only — no command execution needed.
      // If command contains editor state (from file-based polling), use it
      // directly; otherwise fall back to reading AX state via Talon action.
      if (commandId === "hatbox.reallocateHats") {
        const editorState: EditorState =
          (command as EditorState) ??
          talon.actions.user.cursorless_everywhere_get_editor_state();
        ide.updateTextEditors(editorState);
        await hatTokenMap.allocateHats();
        return;
      }

      if (commandId !== CURSORLESS_COMMAND_ID) {
        throw Error(`Unknown command ID: ${commandId}`);
      }

      // We don't have all the document on change events, so we need to make
      // sure that text editor is up to date before we run the command
      const editorState =
        talon.actions.user.cursorless_everywhere_get_editor_state();
      ide.updateTextEditors(editorState);

      // TalonJsIDE event listeners are no-ops, so HatAllocator's debouncer
      // never fires automatically. Explicitly allocate hats so the hat map
      // is populated and HatBox can render them.
      await hatTokenMap.allocateHats();

      return await commandApi.runCommandSafe(command);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
