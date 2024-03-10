import type { TutorialId } from "@cursorless/common";

interface PickingTutorialState {
  type: "pickingTutorial";
}
interface ActiveTutorialState {
  type: "doingTutorial";
  tutorialId: TutorialId;
  stepNumber: number;
}

export type State = PickingTutorialState | ActiveTutorialState;
