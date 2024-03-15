export type TutorialId = "introduction";

interface PickingTutorialState {
  type: "pickingTutorial";
}

interface ActiveTutorialState {
  type: "doingTutorial";
  tutorialId: TutorialId;
  stepNumber: number;
}

export type TutorialState = PickingTutorialState | ActiveTutorialState;
