import { ActionType, PartialTarget } from "../../typings/Types";

export type CommandArgumentComplete = Required<
  Omit<CommandArgumentLatest, "spokenForm">
> &
  Pick<CommandArgumentLatest, "spokenForm">;

export type CommandArgumentLatest = CommandArgumentV1;
export type CommandArgument = CommandArgumentV0 | CommandArgumentV1;

interface CommandArgumentV1 extends CommandArgumentV0V1 {
  version: 1;
}

interface CommandArgumentV0 extends CommandArgumentV0V1 {
  version: 0;
  usePrePhraseSnapshot?: false;
}

interface CommandArgumentV0V1 {
  /**
   * The version number of the command API
   */
  version: 0 | 1;

  /**
   * The spoken form of the command if issued from a voice command system
   */
  spokenForm?: string;

  /**
   * If the command is issued from a voice command system, this boolean indicates
   * whether we should use the pre phrase snapshot. Only set this to true if the
   * voice command system issues a pre phrase signal at the start of every
   * phrase.
   */
  usePrePhraseSnapshot?: boolean;

  /**
   * The action to run
   */
  action: ActionType;

  /**
   * A list of targets expected by the action. Inference will be run on the
   * targets
   */
  targets: PartialTarget[];

  /**
   * A list of extra arguments expected by the given action.
   */
  extraArgs?: unknown[];
}
