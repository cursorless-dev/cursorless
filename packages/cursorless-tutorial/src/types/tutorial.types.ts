import type { TestCaseSnapshot, TutorialStepFragment } from "@cursorless/common";
import type { TutorialStepTrigger } from "./TutorialStepTrigger";

/**
 * Represents the content of a tutorial. Used internally by the tutorial
 * component to control the tutorial.
 */
export interface TutorialContent {
  /**
   * The title of the tutorial
   */
  title: string;

  /**
   * The version of the tutorial
   */
  version: number;

  /**
   * The steps of the current tutorial
   */
  steps: Array<TutorialStep>;
}

export interface TutorialStep {
  /**
   * The content of the current step. Each element in the array represents a
   * paragraph in the tutorial step.
   */
  content: TutorialStepFragment[][];

  /**
   * The path to the yaml file that should be used to setup the current step (if
   * any). The path is relative to the tutorial directory for the given tutorial.
   */
  initialState?: TestCaseSnapshot;

  /**
   * The language id to use when opening the editor for the current step
   */
  languageId?: string;

  /**
   * When this happens, advance to the next step
   */
  trigger?: TutorialStepTrigger;
}
