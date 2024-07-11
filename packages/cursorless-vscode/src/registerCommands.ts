import {
  CURSORLESS_COMMAND_ID,
  CursorlessCommandId,
  isTesting,
  type CommandHistoryStorage,
} from "@cursorless/common";
import {
  showCheatsheet,
  updateDefaults,
} from "@cursorless/cursorless-cheatsheet";
import {
  CommandApi,
  StoredTargetMap,
  TestCaseRecorder,
  analyzeCommandHistory,
  type ScopeTestRecorder,
} from "@cursorless/cursorless-engine";
import * as vscode from "vscode";
import { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
import { showDocumentation, showQuickPick } from "./commands";
import { VscodeIDE } from "./ide/vscode/VscodeIDE";
import { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { logQuickActions } from "./logQuickActions";

export function registerCommands(
  extensionContext: vscode.ExtensionContext,
  vscodeIde: VscodeIDE,
  commandApi: CommandApi,
  commandHistoryStorage: CommandHistoryStorage,
  testCaseRecorder: TestCaseRecorder,
  scopeTestRecorder: ScopeTestRecorder,
  scopeVisualizer: ScopeVisualizer,
  keyboardCommands: KeyboardCommands,
  hats: VscodeHats,
  storedTargets: StoredTargetMap,
): void {
  const runCommandWrapper = async (run: () => Promise<unknown>) => {
    try {
      return await run();
    } catch (e) {
      if (!isTesting()) {
        const err = e as Error;
        console.error(err.stack);
        vscodeIde.handleCommandError(err);
      }
      throw e;
    }
  };

  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (...args: unknown[]) => {
      return runCommandWrapper(() => commandApi.runCommandSafe(...args));
    },

    ["cursorless.repeatPreviousCommand"]: async () => {
      return runCommandWrapper(() => commandApi.repeatPreviousCommand());
    },

    // Cheatsheet commands
    ["cursorless.showCheatsheet"]: (arg) => showCheatsheet(vscodeIde, arg),
    ["cursorless.internal.updateCheatsheetDefaults"]: updateDefaults,

    // Testcase recorder commands
    ["cursorless.recordTestCase"]: testCaseRecorder.toggle,
    ["cursorless.recordOneTestCaseThenPause"]:
      testCaseRecorder.recordOneThenPause,
    ["cursorless.pauseRecording"]: testCaseRecorder.pause,
    ["cursorless.resumeRecording"]: testCaseRecorder.resume,
    ["cursorless.takeSnapshot"]: testCaseRecorder.takeSnapshot,

    // Scope test recorder commands
    ["cursorless.recordScopeTests.showUnimplementedFacets"]:
      scopeTestRecorder.showUnimplementedFacets,
    ["cursorless.recordScopeTests.saveActiveDocument"]:
      scopeTestRecorder.saveActiveDocument,

    // Other commands
    ["cursorless.showQuickPick"]: showQuickPick,
    ["cursorless.showDocumentation"]: showDocumentation,

    ["cursorless.private.logQuickActions"]: logQuickActions,

    // Hats
    ["cursorless.toggleDecorations"]: hats.toggle,
    ["cursorless.recomputeDecorationStyles"]: hats.recomputeDecorationStyles,

    // Scope visualizer
    ["cursorless.showScopeVisualizer"]: scopeVisualizer.start,
    ["cursorless.hideScopeVisualizer"]: scopeVisualizer.stop,

    // Command history
    ["cursorless.analyzeCommandHistory"]: () =>
      analyzeCommandHistory(commandHistoryStorage),

    // General keyboard commands
    ["cursorless.keyboard.escape"]:
      keyboardCommands.keyboardHandler.cancelActiveListener,

    // Targeted keyboard commands
    ["cursorless.keyboard.targeted.targetHat"]:
      keyboardCommands.targeted.targetDecoratedMark,

    ["cursorless.keyboard.targeted.targetScope"]:
      keyboardCommands.targeted.modifyTargetContainingScope,

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

    ["cursorless.keyboard.undoTarget"]: () => storedTargets.undo("keyboard"),
    ["cursorless.keyboard.redoTarget"]: () => storedTargets.redo("keyboard"),
  };

  extensionContext.subscriptions.push(
    ...Object.entries(commands).map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
