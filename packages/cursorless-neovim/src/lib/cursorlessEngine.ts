import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { TreeSitter } from "@cursorless/cursorless-engine";

export function initializeCursorlessEngine() {
  debugger;
  const treeSitter: TreeSitter = {} as any;
  const ide = {} as any;
  const hats = {} as any;
  const commandServerApi = {} as any;
  const fileSystem = {} as any;
  const normalizedIde = {} as any;

  const {
    commandApi,
    storedTargets,
    hatTokenMap,
    scopeProvider,
    snippets,
    injectIde,
    runIntegrationTests,
    addCommandRunnerDecorator,
    customSpokenFormGenerator,
  } = createCursorlessEngine(
    treeSitter,
    normalizedIde,
    hats,
    commandServerApi,
    fileSystem,
  );
  debugger;
}
