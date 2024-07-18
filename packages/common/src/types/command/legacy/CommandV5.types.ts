import type { PartialTargetDescriptorV5 } from "./PartialTargetDescriptorV5.types";
import type { ActionCommandV5 } from "./ActionCommandV5";

export interface CommandV5 {
  /**
   * The version number of the command API
   */
  version: 5;

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

  action: ActionCommandV5;

  /**
   * A list of targets expected by the action. Inference will be run on the
   * targets
   */
  targets: PartialTargetDescriptorV5[];
}
