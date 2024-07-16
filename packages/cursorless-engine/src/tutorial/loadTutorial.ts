import {
  RawTutorialContent,
  TutorialContentProvider,
  TutorialId,
  TutorialState,
} from "@cursorless/common";
import { TutorialContent } from "./types/tutorial.types";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { ide } from "../singletons/ide.singleton";
import { TutorialError } from "./TutorialError";
import { TutorialStepParser } from "./TutorialStepParser";

export async function loadTutorial(
  contentProvider: TutorialContentProvider,
  tutorialId: TutorialId,
  customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  rawContent: RawTutorialContent,
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
      ide().globalState.get("tutorialProgress")[tutorialId]?.currentStep ?? 0;

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
