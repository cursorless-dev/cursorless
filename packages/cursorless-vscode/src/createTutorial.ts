import type { Hats, HatTokenMap, IDE } from "@cursorless/common";
import type {
  CommandRunnerDecorator,
  CustomSpokenFormGenerator,
} from "@cursorless/cursorless-engine";
import { TutorialImpl } from "@cursorless/cursorless-tutorial";
import { FileSystemTutorialContentProvider } from "@cursorless/node-common";
import type * as vscode from "vscode";
import type { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
import { VscodeTutorial } from "./VscodeTutorial";
import type { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
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
  hats: Hats,
) {
  const contentProvider = new FileSystemTutorialContentProvider(ide.assetsRoot);

  const tutorial = new TutorialImpl(
    ide,
    hatTokenMap,
    customSpokenFormGenerator,
    contentProvider,
    hats,
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
