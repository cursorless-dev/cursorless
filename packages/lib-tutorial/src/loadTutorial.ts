import type {
  Hats,
  KeyValueStore,
  RawTutorialContent,
  TutorialContentProvider,
  TutorialId,
  TutorialState,
} from "@cursorless/lib-common";
import { getErrorMessage } from "@cursorless/lib-common";
import type { CustomSpokenFormGenerator } from "@cursorless/lib-engine";
import { TutorialError } from "./TutorialError";
import { TutorialStepParser } from "./TutorialStepParser";
import type { TutorialContent } from "./types/tutorial.types";

export async function loadTutorial(
  contentProvider: TutorialContentProvider,
  tutorialId: TutorialId,
  customSpokenFormGenerator: CustomSpokenFormGenerator,
  rawContent: RawTutorialContent,
  keyValueStore: KeyValueStore,
  hats: Hats,
) {
  const parser = new TutorialStepParser(
    contentProvider,
    tutorialId,
    customSpokenFormGenerator,
    hats,
  );

  let tutorialContent: TutorialContent;
  let state: TutorialState;

  try {
    tutorialContent = {
      title: rawContent.title,
      steps: await Promise.all(
        rawContent.steps.map(async (step, index) => {
          try {
            return await parser.parseTutorialStep(step);
          } catch (error) {
            if (error instanceof TutorialError) {
              throw error;
            }

            throw new Error(
              `Failed to parse tutorial "${tutorialId}" step ${index + 1}: ${getErrorMessage(error)}`,
              { cause: error },
            );
          }
        }),
      ),
    };

    let stepNumber =
      keyValueStore.get("tutorialProgress")[tutorialId]?.currentStep ?? 0;

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
  } catch (error) {
    tutorialContent = {
      title: rawContent.title,
      steps: [],
    };
    state = {
      type: "doingTutorial",
      hasErrors: true,
      id: tutorialId,
      stepNumber: 0,
      title: tutorialContent.title,
      preConditionsMet: true,
      errorMessage: getErrorMessage(error),
      requiresTalonUpdate:
        error instanceof TutorialError && error.requiresTalonUpdate,
    };
  }

  return { tutorialContent, state };
}
