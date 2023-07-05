import {
  Command,
  Disposable,
  HatTokenMap,
  IDE,
  IterationScopeChangeEventCallback,
  IterationScopeRangeConfig,
  IterationScopeRanges,
  ScopeChangeEventCallback,
  ScopeRangeConfig,
  ScopeRanges,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { Snippets } from "./core/Snippets";
import { StoredTargetMap } from "./core/StoredTargets";
import { TestCaseRecorder } from "./testCaseRecorder/TestCaseRecorder";

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

export interface ScopeProvider {
  provideScopeRanges: (
    editor: TextEditor,
    { scopeType, visibleOnly }: ScopeRangeConfig,
  ) => ScopeRanges[];

  provideIterationScopeRanges: (
    editor: TextEditor,
    {
      scopeType,
      visibleOnly,
      includeNestedTargets: includeIterationNestedTargets,
    }: IterationScopeRangeConfig,
  ) => IterationScopeRanges[];

  onDidChangeScopeRanges: (
    callback: ScopeChangeEventCallback,
    config: ScopeRangeConfig,
  ) => Disposable;

  onDidChangeIterationScopeRanges: (
    callback: IterationScopeChangeEventCallback,
    config: IterationScopeRangeConfig,
  ) => Disposable;

  getScopeSupport: (editor: TextEditor, scopeType: ScopeType) => ScopeSupport;

  getIterationScopeSupport: (
    editor: TextEditor,
    scopeType: ScopeType,
  ) => ScopeSupport;
}

export enum ScopeSupport {
  supportedAndPresentInEditor,
  supportedButNotPresentInEditor,
  supportedLegacy,
  unsupported,
}
