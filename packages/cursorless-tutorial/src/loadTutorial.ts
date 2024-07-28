import {
  RawTutorialContent,
  TutorialContentProvider,
  TutorialId,
  TutorialState,
  type Storage,
} from "@cursorless/common";
import { CustomSpokenFormGenerator } from "@cursorless/cursorless-engine";
import { TutorialError } from "./TutorialError";
import { TutorialStepParser } from "./TutorialStepParser";
import { TutorialContent } from "./types/tutorial.types";

export async function loadTutorial(
  contentProvider: TutorialContentProvider,
  tutorialId: TutorialId,
  customSpokenFormGenerator: CustomSpokenFormGenerator,
  rawContent: RawTutorialContent,
  storage: Storage,
) {
  const parser = new TutorialStepParser(
    contentProvider,
    tutorialId,
    customSpokenFormGenerator,
  );

  let tutorialContent: TutorialContent;
  let state: TutorialState;

  try {
    tutorialContent = {
      title: rawContent.title,
      version: rawContent.version,
      steps: await Promise.all(rawContent.steps.map(parser.parseTutorialStep)),
    };

    let stepNumber =
      storage.get("tutorialProgress")[tutorialId]?.currentStep ?? 0;

    if (stepNumber >= tutorialContent.steps.length - 1) {
      stepNumber = 0;
    }

    state = {
      type: "doingTutorial",
      hasErrors: false,
      id: tutorialId,
      stepNumber,
      stepContent: tutorialContent.steps[stepNumber].content,
      stepCount: tutorialContent.steps.length,
      title: tutorialContent.title,
      preConditionsMet: true,
    };
  } catch (err) {
    tutorialContent = {
      title: rawContent.title,
      steps: [],
      version: rawContent.version,
    };
    state = {
      type: "doingTutorial",
      hasErrors: true,
      id: tutorialId,
      stepNumber: 0,
      title: tutorialContent.title,
      preConditionsMet: true,
      requiresTalonUpdate:
        err instanceof TutorialError && err.requiresTalonUpdate,
    };
  }

  return { tutorialContent, state };
}
