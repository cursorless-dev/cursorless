import type { ActionDescriptorV6 } from "./ActionDescriptorV6";

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

  /**
   * The action to perform. This field contains everything necessary to actually
   * perform the action. The other fields are just metadata.
   */
  action: ActionDescriptorV6;
}
