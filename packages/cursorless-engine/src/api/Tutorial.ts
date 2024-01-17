export interface TutorialGetContentArg {
  /**
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * The name of the current tutorial
   */
  tutorialName: string;
}

export interface TutorialGetContentResponse {
  /**
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * The steps of the current tutorial
   */
  steps: Array<TutorialStep>;
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
   * The version of the tutorial command.
   */
  version: 0;

  /**
   * The name of the current tutorial
   */
  tutorialName: string;

  /**
   * The yaml file for the current step
   */
  fixturePath: string;
}

export interface Tutorial {
  getContent(arg: TutorialGetContentArg): Promise<TutorialGetContentResponse>;
  setupStep(arg: TutorialSetupStepArg): Promise<void>;
}
