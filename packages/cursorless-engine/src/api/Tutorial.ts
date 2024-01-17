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
   * The text content of the different steps of the current tutorial
   */
  content: Array<string>;

  /**
   * The yaml files of the different steps of the current tutorial (if any)
   */
  yamlFilenames: Array<string>;
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
  yamlFilename: string;
}

export interface Tutorial {
  getContent(arg: TutorialGetContentArg): Promise<TutorialGetContentResponse>;
  setupStep(arg: TutorialSetupStepArg): Promise<void>;
}
