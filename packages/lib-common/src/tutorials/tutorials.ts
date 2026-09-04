import type { TutorialId } from "..";
import type {
  RawTutorialContent,
  ResolvedTutorialContent,
  TutorialContext,
} from "./tutorial.types";
import { tutorial1Introduction } from "./tutorial1Introduction";
import { tutorial2BasicCoding } from "./tutorial2BasicCoding";
import { tutorial3Visualization } from "./tutorial3Visualization";

export const tutorials: RawTutorialContent[] = [
  tutorial1Introduction,
  tutorial2BasicCoding,
  tutorial3Visualization,
];

export function getTutorialsForContext(
  context: TutorialContext,
): ResolvedTutorialContent[] {
  return tutorials
    .filter((tutorial) => tutorial.excludeIn?.includes(context) !== true)
    .map((tutorial) => ({
      ...tutorial,
      position: parseTutorialPosition(tutorial.id),
      steps: tutorial.steps.map((step) => {
        const content =
          typeof step === "string" || Array.isArray(step)
            ? step
            : step[context];

        return Array.isArray(content) ? content.join("\n") : content;
      }),
    }));
}

function parseTutorialPosition(id: TutorialId) {
  const match = id.match(/^(?<position>\d+)-.+$/u);
  const position = match?.groups?.position;

  if (position == null) {
    throw new Error(`Invalid tutorial fixture id: ${id}`);
  }

  return Number(position);
}
