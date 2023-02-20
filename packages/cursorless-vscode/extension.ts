import {
  CURSORLESS_COMMAND_ID,
  FakeIDE,
  isTesting,
  NormalizedIDE,
  Range,
  TargetPlainObject,
  TextDocument,
} from "@cursorless/common";
import {
  Command,
  CommandRunner,
  FactoryMap,
  Graph,
  graphFactories,
  ide,
  injectIde,
  makeGraph,
  plainObjectToTarget,
  showCheatsheet,
  takeSnapshot,
  TestCaseRecorder,
  ThatMark,
  updateDefaults,
} from "@cursorless/cursorless-engine";
import {
  commandIds,
  showDocumentation,
  showQuickPick,
  StatusBarItem,
  VscodeIDE,
} from "@cursorless/cursorless-vscode-core";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";
import KeyboardCommands from "../cursorless-vscode-core/keyboard/KeyboardCommands";

/**
 * Extension entrypoint called by VSCode on Cursorless startup.
 * - Creates a dependency container {@link Graph} with the components that
 * implement Cursorless.
 * - Creates test case recorder {@link TestCaseRecorder} for contributors to
 * use to record test cases.
 * - Creates an entrypoint for running commands {@link CommandRunner}.
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<CursorlessApi> {
  const parseTreeApi = await getParseTreeApi();
  const commandServerApi = await getCommandServerApi();

  const vscodeIDE = new VscodeIDE(context);
  await vscodeIDE.init();

  if (vscodeIDE.runMode !== "production") {
    injectIde(
      new NormalizedIDE(vscodeIDE, new FakeIDE(), vscodeIDE.runMode === "test"),
    );
  } else {
    injectIde(vscodeIDE);
  }

  const getNodeAtLocation = (document: TextDocument, range: Range) => {
    return parseTreeApi.getNodeAtLocation(
      new vscode.Location(document.uri, toVscodeRange(range)),
    );
  };

  const graph = makeGraph({
    ...graphFactories,
    extensionContext: () => context,
    commandServerApi: () => commandServerApi,
    getNodeAtLocation: () => getNodeAtLocation,
  } as FactoryMap<Graph>);
  graph.debug.init();
  graph.snippets.init();
  graph.hatTokenMap.init();
  graph.statusBarItem.init();
  graph.keyboardCommands.init();
  const statusBarItem = StatusBarItem.create(commandIds.showQuickPick);

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  // TODO: Do this using the graph once we migrate its dependencies onto the graph
  const commandRunner = new CommandRunner(graph, thatMark, sourceMark);

  registerCommands(context, vscodeIDE, commandRunner, graph.testCaseRecorder);

  return {
    thatMark,
    sourceMark,
    testHelpers: isTesting()
      ? {
          graph,
          ide: ide() as NormalizedIDE,
          injectIde,

          // FIXME: Remove this once we have a better way to get this function
          // accessible from our tests
          plainObjectToTarget: (
            editor: vscode.TextEditor,
            plainObject: TargetPlainObject,
          ) => {
            return plainObjectToTarget(
              vscodeIDE.fromVscodeEditor(editor),
              plainObject,
            );
          },

          // FIXME: Remove this once we have a better way to get this function
          // accessible from our tests
          takeSnapshot,
        }
      : undefined,

    experimental: {
      registerThirdPartySnippets: graph.snippets.registerThirdPartySnippets,
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}

function registerCommands(
  extensionContext: vscode.ExtensionContext,
  vscodeIde: VscodeIDE,
  commandRunner: CommandRunner,
  testCaseRecorder: TestCaseRecorder,
  keyboardCommands: KeyboardCommands,
): void {
  const commands = [
    // The core Cursorless command
    [
      CURSORLESS_COMMAND_ID,
      async (spokenFormOrCommand: string | Command, ...rest: unknown[]) => {
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
    ],

    // Cheatsheet commands
    ["cursorless.showCheatsheet", showCheatsheet],
    ["cursorless.internal.updateCheatsheetDefaults", updateDefaults],

    // Testcase recorder commands
    ["cursorless.recordTestCase", testCaseRecorder.toggle],
    ["cursorless.pauseRecording", testCaseRecorder.pause],
    ["cursorless.resumeRecording", testCaseRecorder.resume],
    ["cursorless.takeSnapshot", testCaseRecorder.takeSnapshot],

    // Other commands
    [commandIds.showQuickPick, showQuickPick],
    ["cursorless.showDocumentation", showDocumentation],

    // Keyboard
    [
      "cursorless.keyboard.targeted.targetHat",
      keyboardCommands.targeted.targetDecoratedMark,
    ],
    [
      "cursorless.keyboard.targeted.targetScope",
      keyboardCommands.targeted.targetScopeType,
    ],
    [
      "cursorless.keyboard.targeted.targetSelection",
      keyboardCommands.targeted.targetSelection,
    ],
    [
      "cursorless.keyboard.targeted.clearTarget",
      keyboardCommands.targeted.clearTarget,
    ],
    [
      "cursorless.keyboard.targeted.runActionOnTarget",
      keyboardCommands.targeted.performActionOnTarget,
    ],
  ] as const;

  extensionContext.subscriptions.push(
    ...commands.map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
