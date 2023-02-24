import {
  Command,
  CURSORLESS_COMMAND_ID,
  FakeIDE,
  isTesting,
  NormalizedIDE,
  Range,
  TargetPlainObject,
  TextDocument,
} from "@cursorless/common";
import {
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
  KeyboardCommands,
  showDocumentation,
  showQuickPick,
  StatusBarItem,
  toVscodeEditor,
  VscodeIDE,
} from "@cursorless/cursorless-vscode-core";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
  toVscodeRange,
} from "@cursorless/vscode-common";
import * as vscode from "vscode";

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

  const statusBarItem = StatusBarItem.create(commandIds.showQuickPick);
  const keyboardCommands = KeyboardCommands.create(context, statusBarItem);

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  // TODO: Do this using the graph once we migrate its dependencies onto the graph
  const commandRunner = new CommandRunner(graph, thatMark, sourceMark);

  registerCommands(
    context,
    vscodeIDE,
    commandRunner,
    graph.testCaseRecorder,
    keyboardCommands,
  );

  return {
    testHelpers: isTesting()
      ? {
          graph,
          ide: ide() as NormalizedIDE,
          injectIde,

          toVscodeEditor,

          // FIXME: Remove this once we have a better way to get this function
          // accessible from our tests
          takeSnapshot,

          setThatMark(
            editor: vscode.TextEditor,
            targets: TargetPlainObject[] | undefined,
          ): void {
            thatMark.set(
              targets?.map((target) =>
                plainObjectToTarget(vscodeIDE.fromVscodeEditor(editor), target),
              ),
            );
          },
          setSourceMark(
            editor: vscode.TextEditor,
            targets: TargetPlainObject[] | undefined,
          ): void {
            sourceMark.set(
              targets?.map((target) =>
                plainObjectToTarget(vscodeIDE.fromVscodeEditor(editor), target),
              ),
            );
          },

          hatTokenMap: graph.hatTokenMap,
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

    // General keyboard commands
    [
      "cursorless.keyboard.escape",
      keyboardCommands.keyboardHandler.cancelActiveListener,
    ],

    // Targeted keyboard commands
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

    // Modal keyboard commands
    ["cursorless.keyboard.modal.modeOn", keyboardCommands.modal.modeOn],
    ["cursorless.keyboard.modal.modeOff", keyboardCommands.modal.modeOff],
    ["cursorless.keyboard.modal.modeToggle", keyboardCommands.modal.modeToggle],
  ] as const;

  extensionContext.subscriptions.push(
    ...commands.map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
