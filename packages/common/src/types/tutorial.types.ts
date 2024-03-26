export type TutorialId = "introduction";

interface PickingTutorialState {
  type: "pickingTutorial";
}

interface ActiveTutorialState {
  type: "doingTutorial";
  tutorialId: TutorialId;
  stepNumber: number;
  stepContent: string;
  stepCount: number;
}

export type TutorialState = PickingTutorialState | ActiveTutorialState;
