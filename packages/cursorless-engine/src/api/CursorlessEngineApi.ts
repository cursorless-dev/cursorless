import type {
  Command,
  CommandResponse,
  HatTokenMap,
  IDE,
  ReadOnlyHatMap,
  ScopeProvider,
} from "@cursorless/common";
import type { CommandRunner } from "../CommandRunner";
import type { Snippets } from "../core/Snippets";
import type { StoredTargetMap } from "../core/StoredTargets";

export interface CursorlessEngine {
  commandApi: CommandApi;
  scopeProvider: ScopeProvider;
  customSpokenFormGenerator: CustomSpokenFormGenerator;
  storedTargets: StoredTargetMap;
  hatTokenMap: HatTokenMap;
  snippets: Snippets;
  injectIde: (ide: IDE | undefined) => void;
  runIntegrationTests: () => Promise<void>;
  addCommandRunnerDecorator: (
    commandRunnerDecorator: CommandRunnerDecorator,
  ) => void;
}

export interface CustomSpokenFormGenerator {
  /**
   * If `true`, indicates they need to update their Talon files to get the
   * machinery used to share spoken forms from Talon to the VSCode extension.
   */
  readonly needsInitialTalonUpdate: boolean | undefined;

  onDidChangeCustomSpokenForms: (listener: () => void) => void;
}

export interface CommandApi {
  /**
   * Runs a command.  This is the core of the Cursorless engine.
   * @param command The command to run
   */
  runCommand(command: Command): Promise<CommandResponse | unknown>;

  /**
   * Designed to run commands that come directly from the user.  Ensures that
   * the command args are of the correct shape.
   */
  runCommandSafe(...args: unknown[]): Promise<CommandResponse | unknown>;
}

export interface CommandRunnerDecorator {
  /**
   * @param commandRunner: A CommandRunner.
   * @param readableHatMap: A ReadOnlyHatMap.
   * @returns A new CommandRunner that invokes the provided CommandRunner in
   *   addition to performing some other work.
   */
  wrapCommandRunner: (
    readableHatMap: ReadOnlyHatMap,
    commandRunner: CommandRunner,
  ) => CommandRunner;
}
