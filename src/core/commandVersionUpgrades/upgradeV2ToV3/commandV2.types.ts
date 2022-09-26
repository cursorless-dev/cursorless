import { ActionType } from "../../../actions/actions.types";
import { PartialTargetDescriptor } from "../../../typings/targetDescriptor.types";

interface ActionCommand {
  /**
   * The action to run
   */
  name: ActionType;

  /**
   * A list of arguments expected by the given action.
   */
  args?: unknown[];
}

export interface CommandV2 {
  /**
   * The version number of the command API
   */
  version: 2;

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
  usePrePhraseSnapshot: boolean;

  action: ActionCommand;

  /**
   * A list of targets expected by the action. Inference will be run on the
   * targets
   */
  targets: PartialTargetDescriptor[];
}
