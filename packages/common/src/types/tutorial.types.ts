export type TutorialId = "introduction";

interface StartTutorialMessage {
  type: "startTutorial";
  tutorialId: TutorialId;
}

export type TutorialMessage = StartTutorialMessage;
