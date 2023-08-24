import type { Command, HatTokenMap, IDE } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";
import type { StoredTargetMap } from "../core/StoredTargets";
import type { TestCaseRecorder } from "../testCaseRecorder/TestCaseRecorder";
import type { ScopeProvider } from "./ScopeProvider";

export interface CursorlessEngine {
  commandApi: CommandApi;
  scopeProvider: ScopeProvider;
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
