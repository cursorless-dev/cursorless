import { CURSORLESS_COMMAND_ID, Range, TextDocument } from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { showCheatsheet, updateDefaults } from "./core/Cheatsheet";
import CommandRunner from "./core/commandRunner/CommandRunner";
import { Command } from "./core/commandRunner/typings/command.types";
import { ThatMark } from "./core/ThatMark";
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
import { plainObjectToTarget } from "./testUtil/plainObjectToTarget";
import isTesting from "./testUtil/isTesting";
import { TestCaseRecorder } from "./testUtil/TestCaseRecorder";
import { Graph } from "./typings/Types";
import graphFactories from "./util/graphFactories";
import makeGraph, { FactoryMap } from "./util/makeGraph";

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
  graph.testCaseRecorder.init();
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
  extensionContext.subscriptions.push(
    vscode.commands.registerCommand(
      CURSORLESS_COMMAND_ID,
      async (spokenFormOrCommand: string | Command, ...rest: unknown[]) => {
        try {
          return await commandRunner.runCommandBackwardCompatible(
            spokenFormOrCommand,
            ...rest,
          );
        } catch (e) {
          const error = e as Error;
          if (!isTesting()) {
            vscodeIde.handleCommandError(error);
          }
          await testCaseRecorder.commandErrorHook(error);
          throw error;
        }
      },
    ),

    vscode.commands.registerCommand(
      "cursorless.showCheatsheet",
      showCheatsheet,
    ),
    vscode.commands.registerCommand(
      "cursorless.internal.updateCheatsheetDefaults",
      updateDefaults,
    ),
  );
}
