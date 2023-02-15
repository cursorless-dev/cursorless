import {
  CURSORLESS_COMMAND_ID,
  isTesting,
  Range,
  TextDocument,
} from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import {
  showCheatsheet,
  updateDefaults,
} from "./libs/cursorless-engine/core/Cheatsheet";
import CommandRunner from "./libs/cursorless-engine/core/commandRunner/CommandRunner";
import { Command } from "./libs/cursorless-engine/core/commandRunner/typings/command.types";
import { ThatMark } from "./libs/cursorless-engine/core/ThatMark";
import VscodeIDE from "./ide/vscode/VscodeIDE";
import FakeIDE from "./libs/common/ide/fake/FakeIDE";
import NormalizedIDE from "./libs/common/ide/normalized/NormalizedIDE";
import ide, {
  injectIde,
} from "./libs/cursorless-engine/singletons/ide.singleton";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
} from "./libs/vscode-common/getExtensionApi";
import { TargetPlainObject } from "./libs/common/testUtil/toPlainObject";
import { plainObjectToTarget } from "./libs/cursorless-engine/testUtil/plainObjectToTarget";
import { TestCaseRecorder } from "./libs/cursorless-engine/testCaseRecorder/TestCaseRecorder";
import { Graph } from "./libs/cursorless-engine/typings/Types";
import graphFactories from "./libs/cursorless-engine/util/graphFactories";
import makeGraph, { FactoryMap } from "./libs/cursorless-engine/util/makeGraph";

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
