import * as vscode from "vscode";
import type {
  CommandHistoryStorage,
  CursorlessCommandId,
  ScopeType,
} from "@cursorless/lib-common";
import { CURSORLESS_COMMAND_ID } from "@cursorless/lib-common";
import type { CommandApi, StoredTargetMap } from "@cursorless/lib-engine";
import { analyzeCommandHistory } from "@cursorless/lib-engine";
import {
  showCheatsheet,
  updateDefaults,
  type CheatSheetCommandArg,
} from "@cursorless/lib-node-common";
import type {
  ScopeTestRecorder,
  TestCaseRecorder,
} from "@cursorless/lib-test-case-recorder";
import {
  showDocumentation,
  showQuickPick,
  showScopeVisualizerItemDocumentation,
} from "./commands";
import type { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import type { VscodeIDE } from "./ide/vscode/VscodeIDE";
import type { InstallationDependencies } from "./InstallationDependencies";
import type { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { logQuickActions } from "./logQuickActions";
import type {
  ScopeVisualizer,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";
import type { VscodeTutorial } from "./VscodeTutorial";

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
  tutorial: VscodeTutorial,
  installationDependencies: InstallationDependencies,
  storedTargets: StoredTargetMap,
): void {
  const runCommandWrapper = async (run: () => Promise<unknown>) => {
    try {
      return await run();
    } catch (error) {
      if (vscodeIde.runMode !== "test") {
        if (error instanceof Error) {
          console.error(error.stack);
        }
        vscodeIde.handleCommandError(error);
      }
      throw error;
    }
  };

  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: (...args: unknown[]) => {
      return runCommandWrapper(() => commandApi.runCommandSafe(...args));
    },

    ["cursorless.repeatPreviousCommand"]: () => {
      return runCommandWrapper(() => commandApi.repeatPreviousCommand());
    },

    // Cheatsheet commands
    ["cursorless.showCheatsheet"]: (arg: CheatSheetCommandArg) =>
      showCheatsheet(vscodeIde, arg),
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
    ["cursorless.showInstallationDependencies"]: installationDependencies.show,

    ["cursorless.private.logQuickActions"]: logQuickActions,

    // Hats
    ["cursorless.toggleDecorations"]: hats.toggle,
    ["cursorless.recomputeDecorationStyles"]: hats.recomputeDecorationStyles,

    // Scope visualizer
    ["cursorless.showScopeVisualizer"]: (
      scopeType?: ScopeType,
      visualizationType?: VisualizationType,
    ) => {
      if (scopeType == null || visualizationType == null) {
        throw new Error("Missing arguments. Only for internal use.");
      }
      scopeVisualizer.start(scopeType, visualizationType);
    },
    ["cursorless.hideScopeVisualizer"]: scopeVisualizer.stop,
    ["cursorless.scopeVisualizer.openUrl"]:
      showScopeVisualizerItemDocumentation,

    // Command history
    ["cursorless.analyzeCommandHistory"]: () =>
      analyzeCommandHistory(vscodeIde, commandHistoryStorage),

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

    // Tutorial commands
    ["cursorless.tutorial.start"]: tutorial.start,
    ["cursorless.tutorial.next"]: tutorial.next,
    ["cursorless.tutorial.previous"]: tutorial.previous,
    ["cursorless.tutorial.restart"]: tutorial.restart,
    ["cursorless.tutorial.resume"]: tutorial.resume,
    ["cursorless.tutorial.list"]: tutorial.list,
    ["cursorless.documentationOpened"]: tutorial.documentationOpened,
  };

  extensionContext.subscriptions.push(
    ...Object.entries(commands).map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
