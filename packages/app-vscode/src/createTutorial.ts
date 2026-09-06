import type * as vscode from "vscode";
import type { Hats, HatTokenMap, IDE } from "@cursorless/lib-common";
import type {
  CommandRunnerDecorator,
  CustomSpokenFormGenerator,
} from "@cursorless/lib-engine";
import { FileSystemTutorialContentProvider } from "@cursorless/lib-node-common";
import { TutorialImpl } from "@cursorless/lib-tutorial";
import type { VscodeFileSystem } from "./ide/vscode/VscodeFileSystem";
import type { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
import { vscodeApi } from "./vscodeApi";
import { VscodeTutorial } from "./VscodeTutorial";

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
