import {
  Command,
  HatTokenMap,
  IDE,
  IdeScopeVisualizer,
  ScopeType,
} from "@cursorless/common";
import { Snippets } from "./core/Snippets";
import { StoredTargetMap } from "./core/StoredTargets";
import { TestCaseRecorder } from "./testCaseRecorder/TestCaseRecorder";

export interface CursorlessEngine {
  commandApi: CommandApi;
  scopeVisualizer: ScopeVisualizer;
  testCaseRecorder: TestCaseRecorder;
  storedTargets: StoredTargetMap;
  hatTokenMap: HatTokenMap;
  snippets: Snippets;
  injectIde: (ide: IDE | undefined) => void;
  runIntegrationTests: () => Promise<void>;
}

export interface CommandApi {
  /**
   * Runs a command.  This is the core of the Cursorless engine.
   * @param command The command to run
   */
  runCommand(command: Command): Promise<unknown>;

  /**
   * Designed to run commands that come directly from the user.  Ensures that
   * the command args are of the correct shape.
   */
  runCommandSafe(...args: unknown[]): Promise<unknown>;
}

export interface ScopeVisualizer {
  start(ideScopeVisualizer: IdeScopeVisualizer): void;
  stop(): void;
}

export interface ScopeVisualizerConfig {
  scopeType: ScopeType;
  includeScopes: boolean;
  includeIterationScopes: boolean;
  includeIterationNestedTargets: boolean;
}
