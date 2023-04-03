import {
  Command,
  CursorlessCommandId,
  CURSORLESS_COMMAND_ID,
  isTesting,
} from "@cursorless/common";
import {
  CommandRunner,
  showCheatsheet,
  TestCaseRecorder,
  updateDefaults,
} from "@cursorless/cursorless-engine";
import {
  KeyboardCommands,
  showDocumentation,
  showQuickPick,
  VscodeHats,
  VscodeIDE,
} from "@cursorless/cursorless-vscode-core";
import * as vscode from "vscode";

export function registerCommands(
  extensionContext: vscode.ExtensionContext,
  vscodeIde: VscodeIDE,
  commandRunner: CommandRunner,
  testCaseRecorder: TestCaseRecorder,
  keyboardCommands: KeyboardCommands,
  hats: VscodeHats,
): void {
  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (
      spokenFormOrCommand: string | Command,
      ...rest: unknown[]
    ) => {
      try {
        return await commandRunner.runCommandBackwardCompatible(
          spokenFormOrCommand,
          ...rest,
        );
      } catch (e) {
        if (!isTesting()) {
          vscodeIde.handleCommandError(e as Error);
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
