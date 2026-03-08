import type { CommandComplete, ScopeType } from "@cursorless/common";

/**
 * Advance to the next step when the user completes a command
 */
export interface CommandTutorialStepTrigger {
  type: "command";

  /**
   * The command we're waiting for to advance to the next step
   */
  command: CommandComplete;
}

/**
 * Advance to the next step when the user completes a command
 */
export interface CommandTutorialVisualizeTrigger {
  type: "visualize";

  /**
   * The command we're waiting for to advance to the next step
   */
  scopeType: ScopeType | undefined;
}

/**
 * Advance to the next step when the user opens the documentation
 */
export interface HelpTutorialStepTrigger {
  type: "help";
}

/**
 * Represents a trigger that advances to the next step in a tutorial when a
 * certain condition is met.
 */
export type TutorialStepTrigger =
  | CommandTutorialStepTrigger
  | CommandTutorialVisualizeTrigger
  | HelpTutorialStepTrigger;
