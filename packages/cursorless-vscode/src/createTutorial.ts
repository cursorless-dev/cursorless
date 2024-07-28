import { HatTokenMap, IDE } from "@cursorless/common";
import {
  CommandRunnerDecorator,
  CustomSpokenFormGenerator,
} from "@cursorless/cursorless-engine";
import { TutorialImpl } from "@cursorless/cursorless-tutorial";
import { FileSystemTutorialContentProvider } from "@cursorless/node-common";
import * as vscode from "vscode";
import { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
import { VscodeTutorial } from "./VscodeTutorial";
import { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import { vscodeApi } from "./vscodeApi";

export function createTutorial(
  context: vscode.ExtensionContext,
  ide: IDE,
  scopeVisualizer: ScopeVisualizer,
  fileSystem: VscodeFileSystem,
  addCommandRunnerDecorator: (
    commandRunnerDecorator: CommandRunnerDecorator,
  ) => void,
  hatTokenMap: HatTokenMap,
  customSpokenFormGenerator: CustomSpokenFormGenerator,
) {
  const contentProvider = new FileSystemTutorialContentProvider(ide.assetsRoot);

  const tutorial = new TutorialImpl(
    ide,
    hatTokenMap,
    customSpokenFormGenerator,
    contentProvider,
  );
  ide.disposeOnExit(tutorial);
  addCommandRunnerDecorator(tutorial);

  return new VscodeTutorial(
    context,
    vscodeApi,
    tutorial,
    scopeVisualizer,
    fileSystem,
  );
}
