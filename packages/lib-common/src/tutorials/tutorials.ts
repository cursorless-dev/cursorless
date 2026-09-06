import type {
  RawTutorialContent,
  ResolvedTutorialContent,
  TutorialContext,
} from "./tutorial.types";
import { tutorialBasicCoding } from "./tutorialBasicCoding";
import { tutorialIntroduction } from "./tutorialIntroduction";
import { tutorialVisualization } from "./tutorialVisualization";

export const tutorials: RawTutorialContent[] = [
  tutorialIntroduction,
  tutorialBasicCoding,
  tutorialVisualization,
];

export function getTutorialsForContext(
  context: TutorialContext,
): ResolvedTutorialContent[] {
  return (
    tutorials
      .map((tutorial, index) => ({
        ...tutorial,
        position: index + 1,
        steps: tutorial.steps.map((step) => {
          const content =
            typeof step === "string" || Array.isArray(step)
              ? step
              : step[context];

          return Array.isArray(content) ? content.join("\n") : content;
        }),
      }))
      // Need to be done at the end so the index is correct for each tutorial
      .filter((tutorial) => tutorial.excludeIn?.includes(context) !== true)
  );
}
