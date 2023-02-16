import {
  CURSORLESS_COMMAND_ID,
  isTesting,
  Range,
  TextDocument,
} from "./packages/common";
import { toVscodeRange } from "./packages/vscode-common";
import * as vscode from "vscode";
import VscodeIDE from "./ide/vscode/VscodeIDE";
import FakeIDE from "./packages/common/ide/fake/FakeIDE";
import { NormalizedIDE } from "./packages/common/ide/normalized/NormalizedIDE";
import { TargetPlainObject } from "./packages/common/testUtil/toPlainObject";
import {
  showCheatsheet,
  updateDefaults,
} from "./packages/cursorless-engine/core/Cheatsheet";
import CommandRunner from "./packages/cursorless-engine/core/commandRunner/CommandRunner";
import { Command } from "./packages/cursorless-engine/core/commandRunner/typings/command.types";
import { ThatMark } from "./packages/cursorless-engine/core/ThatMark";
import ide, {
  injectIde,
} from "./packages/cursorless-engine/singletons/ide.singleton";
import { TestCaseRecorder } from "./packages/cursorless-engine/testCaseRecorder/TestCaseRecorder";
import { plainObjectToTarget } from "./packages/cursorless-engine/testUtil/plainObjectToTarget";
import { takeSnapshot } from "./packages/cursorless-engine/testUtil/takeSnapshot";
import { Graph } from "./packages/cursorless-engine/typings/Types";
import graphFactories from "./packages/cursorless-engine/util/graphFactories";
import makeGraph, { FactoryMap } from "./packages/cursorless-engine/util/makeGraph";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
} from "./packages/vscode-common/getExtensionApi";

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
  ] as const;

  extensionContext.subscriptions.push(
    ...commands.map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
