import type {
  ActionType,
  Command,
  CommandComplete,
  CommandResponse,
  Disposable,
  HatTokenMap,
  IDE,
  ReadOnlyHatMap,
  ScopeProvider,
  ScopeType,
  SpokenForm,
} from "@cursorless/common";
import type { CommandRunner } from "../CommandRunner";
import type { StoredTargetMap } from "../core/StoredTargets";

export interface CursorlessEngine {
  commandApi: CommandApi;
  scopeProvider: ScopeProvider;
  customSpokenFormGenerator: CustomSpokenFormGenerator;
  storedTargets: StoredTargetMap;
  hatTokenMap: HatTokenMap;
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

  onDidChangeCustomSpokenForms(listener: () => void): Disposable;

  commandToSpokenForm(command: CommandComplete): SpokenForm;
  scopeTypeToSpokenForm(scopeType: ScopeType): SpokenForm;
  actionIdToSpokenForm(actionId: ActionType): SpokenForm;
  graphemeToSpokenForm(grapheme: string): SpokenForm;
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

  /**
   * Repeats the previous command.
   */
  repeatPreviousCommand(): Promise<CommandResponse | unknown>;
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
