export type TutorialId = "unit-1-basics" | "unit-2-basic-coding";

interface BaseTutorialInfo {
  id: TutorialId;
  title: string;
}

export interface TutorialInfo extends BaseTutorialInfo {
  version: number;
  stepCount: number;
  currentStep: number;
}

interface PickingTutorialState {
  type: "pickingTutorial";
  tutorials: TutorialInfo[];
}

interface LoadingState {
  type: "loading";
}

/**
 * Descriptive text as part of a tutorial step
 */
interface TutorialStepStringFragment {
  type: "string";
  value: string;
}

/**
 * A command embedded in a tutorial step that the user must say
 */
interface TutorialStepCommandFragment {
  type: "command";
  value: string;
}

/**
 * A term embedded in a tutorial step. This does not correspond to a complete
 * command, but rather a single term that can be part of a command. For example:
 * a scope, action name, etc
 */
interface TutorialStepTermFragment {
  type: "term";
  value: string;
}

export type TutorialStepFragment =
  | TutorialStepCommandFragment
  | TutorialStepStringFragment
  | TutorialStepTermFragment;

interface ActiveTutorialState extends BaseTutorialInfo {
  type: "doingTutorial";
  stepNumber: number;
  preConditionsMet: boolean;
}

export interface ActiveTutorialNoErrorsState extends ActiveTutorialState {
  hasErrors: false;
  stepContent: TutorialStepFragment[][];
  stepCount: number;
}

export interface ActiveTutorialErrorsState extends ActiveTutorialState {
  hasErrors: true;
  requiresTalonUpdate: boolean;
}

export type TutorialState =
  | PickingTutorialState
  | LoadingState
  | ActiveTutorialNoErrorsState
  | ActiveTutorialErrorsState;
