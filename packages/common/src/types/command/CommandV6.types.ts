import type { PartialTargetDescriptor } from "./PartialTargetDescriptor.types";
import type { ActionCommand } from "./ActionCommand";

export interface CommandV6 {
  /**
   * The version number of the command API
   */
  version: 6;

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
