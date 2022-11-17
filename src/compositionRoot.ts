import * as vscode from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import Actions from "./actions";
import { initializeCheatsheet } from "./core/Cheatsheet";
import CommandRunner from "./core/commandRunner/CommandRunner";
import Debug from "./core/Debug";
import { Snippets } from "./core/Snippets";
import { ThatMark } from "./core/ThatMark";
import VscodeIDE from "./ide/vscode/VscodeIDE";
import { CURSORLESS_COMMAND_ID } from "./libs/common/commandIds";
import { IDE } from "./libs/common/ide/types/ide.types";
import { CommandServerApi } from "./libs/vscode-common/getExtensionApi";
import { TargetPlainObject } from "./libs/vscode-common/testUtil/toPlainObject";
import { plainObjectToTarget } from "./testUtil/fromPlainObject";
import { Graph } from "./typings/Types";
import graphFactories from "./util/graphFactories";
import makeGraph, { FactoryMap } from "./util/makeGraph";

export async function compositionRoot(
  context: vscode.ExtensionContext,
  commandServerApi: CommandServerApi | null,
  getNodeAtLocation: (location: vscode.Location) => SyntaxNode,
) {
  const ide = (() => {
    const bareIde = new VscodeIDE(context);
    if (bareIde.runMode === "production") {
      return bareIde;
    }
    return getNormalizedIde(bareIde);
  })();
  const { configuration, assetsRoot, commands, runMode } = ide;

  const debug = new Debug(runMode);
  const snippets = await Snippets.create(configuration, assetsRoot);

  ide.disposeOnExit(...initializeCheatsheet(commands), debug, snippets);

  const graph = makeGraph({
    ...graphFactories,
    extensionContext: () => context,
    commandServerApi: () => commandServerApi,
    getNodeAtLocation: () => getNodeAtLocation,
  } as FactoryMap<Graph>);
  graph.fontMeasurements.init(context);
  await graph.decorations.init(context);
  graph.hatTokenMap.init();
  graph.testCaseRecorder.init();
  graph.statusBarItem.init();

  const thatMark = new ThatMark();
  const sourceMark = new ThatMark();

  ide.disposeOnExit(
    commands.registerCommand(CURSORLESS_COMMAND_ID, (...args: unknown[]) =>
      new CommandRunner(
        ide,
        debug,
        hatTokenMap,
        new Actions(rangeUpdater, editStyles),
        getNodeAtLocation,
        editStyles,
        testCaseRecorder,
        thatMark,
        sourceMark,
      ).runCommand(args),
    ),
  );

  return {
    thatMark,
    sourceMark,
    snippets,
    plainObjectToTarget: (
      editor: vscode.TextEditor,
      plainObject: TargetPlainObject,
    ) => {
      return plainObjectToTarget(
        vscodeIDE.fromVscodeEditor(editor),
        plainObject,
      );
    },
  };
}

function getNormalizedIde(ide: IDE): IDE {
  throw Error("Not implemented");
}
