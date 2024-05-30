import {
  CommandComplete,
  Disposable,
  ScopeType,
  TestCaseSnapshot,
  TutorialId,
  TutorialState,
  TutorialStepFragment,
} from "@cursorless/common";

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

export interface RawTutorialContent {
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
  steps: string[];
}

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

export type TutorialStepTrigger =
  | CommandTutorialStepTrigger
  | CommandTutorialVisualizeTrigger
  | HelpTutorialStepTrigger;

export interface TutorialStep {
  /**
   * The text content of the current step
   */
  content: TutorialStepFragment[];

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
  start(id: TutorialId | number): Promise<void>;
  onState(callback: (state: TutorialState) => void): Disposable;
  docsOpened(): void;
  scopeTypeVisualized(scopeType: ScopeType | undefined): void;
  next(): Promise<void>;
  previous(): Promise<void>;
  restart(): Promise<void>;
  resume(): Promise<void>;
  list(): Promise<void>;
  readonly state: TutorialState;
}
