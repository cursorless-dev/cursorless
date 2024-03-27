import { TutorialId } from "@cursorless/common";

export interface TutorialContent {
  /**
   * The title of the tutorial
   */
  title: string;

  /**
   * The steps of the current tutorial
   */
  steps: Array<TutorialStep>;
}

export interface RawTutorialContent {
  /**
   * The title of the tutorial
   */
  title: string;

  /**
   * The steps of the current tutorial
   */
  steps: string[];
}

export interface TutorialStep {
  /**
   * The text content of the current step
   */
  content: string;

  /**
   * The path to the yaml file that should be used to setup the current step (if
   * any). The path is relative to the tutorial directory for the given tutorial.
   */
  fixturePath?: string;
}

export interface TutorialSetupStepArg {
  /**
   * The id of the current tutorial
   */
  tutorialId: string;

  /**
   * The yaml file for the current step
   */
  fixturePath: string;
}

export interface Tutorial {
  getContent(id: TutorialId): Promise<TutorialContent>;
  setupStep(arg: TutorialSetupStepArg): Promise<void>;
}
