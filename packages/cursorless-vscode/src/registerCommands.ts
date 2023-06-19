import {
  CURSORLESS_COMMAND_ID,
  CursorlessCommandId,
  isTesting,
} from "@cursorless/common";
import {
  CommandApi,
  ScopeVisualizer,
  TestCaseRecorder,
  showCheatsheet,
  updateDefaults,
} from "@cursorless/cursorless-engine";
import * as vscode from "vscode";
import { showDocumentation, showQuickPick } from "./commands";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import { KeyboardCommands } from "./keyboard/KeyboardCommands";

export function registerCommands(
  extensionContext: vscode.ExtensionContext,
  vscodeIde: VscodeIDE,
  commandApi: CommandApi,
  testCaseRecorder: TestCaseRecorder,
  scopeVisualizer: ScopeVisualizer,
  keyboardCommands: KeyboardCommands,
  hats: VscodeHats,
): void {
  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (...args: unknown[]) => {
      try {
        return await commandApi.runCommandSafe(...args);
      } catch (e) {
        if (!isTesting()) {
          const err = e as Error;
          console.error(err.stack);
          vscodeIde.handleCommandError(err);
        }
        throw e;
      }
    },

    // Cheatsheet commands
    ["cursorless.showCheatsheet"]: showCheatsheet,
    ["cursorless.internal.updateCheatsheetDefaults"]: updateDefaults,

    // Testcase recorder commands
    ["cursorless.recordTestCase"]: testCaseRecorder.toggle,
    ["cursorless.pauseRecording"]: testCaseRecorder.pause,
    ["cursorless.resumeRecording"]: testCaseRecorder.resume,
    ["cursorless.takeSnapshot"]: testCaseRecorder.takeSnapshot,

    // Other commands
    ["cursorless.showQuickPick"]: showQuickPick,
    ["cursorless.showDocumentation"]: showDocumentation,

    // Hats
    ["cursorless.toggleDecorations"]: hats.toggle,
    ["cursorless.recomputeDecorationStyles"]: hats.recomputeDecorationStyles,

    // Scope visualizer
    ["cursorless.showScopeVisualizer"]: scopeVisualizer.start,
    ["cursorless.hideScopeVisualizer"]: scopeVisualizer.stop,

    // General keyboard commands
    ["cursorless.keyboard.escape"]:
      keyboardCommands.keyboardHandler.cancelActiveListener,

    // Targeted keyboard commands
    ["cursorless.keyboard.targeted.targetHat"]:
      keyboardCommands.targeted.targetDecoratedMark,

    ["cursorless.keyboard.targeted.targetScope"]:
      keyboardCommands.targeted.targetScopeType,

    ["cursorless.keyboard.targeted.targetSelection"]:
      keyboardCommands.targeted.targetSelection,

    ["cursorless.keyboard.targeted.clearTarget"]:
      keyboardCommands.targeted.clearTarget,

    ["cursorless.keyboard.targeted.runActionOnTarget"]:
      keyboardCommands.targeted.performActionOnTarget,

    // Modal keyboard commands
    ["cursorless.keyboard.modal.modeOn"]: keyboardCommands.modal.modeOn,
    ["cursorless.keyboard.modal.modeOff"]: keyboardCommands.modal.modeOff,
    ["cursorless.keyboard.modal.modeToggle"]: keyboardCommands.modal.modeToggle,
  };

  extensionContext.subscriptions.push(
    ...Object.entries(commands).map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
