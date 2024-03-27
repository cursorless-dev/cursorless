export type TutorialId = "introduction";

interface PickingTutorialState {
  type: "pickingTutorial";
}

export interface ActiveTutorialState {
  type: "doingTutorial";
  title: string;
  tutorialId: TutorialId;
  stepNumber: number;
  stepContent: string;
  stepCount: number;
}

export type TutorialState = PickingTutorialState | ActiveTutorialState;
