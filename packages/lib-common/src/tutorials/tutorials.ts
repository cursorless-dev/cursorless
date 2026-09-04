import type { RawTutorialContent, TutorialContext } from "./tutorial.types";
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
): RawTutorialContent[] {
  return tutorials.filter(
    (tutorial) => tutorial.excludeIn?.includes(context) !== true,
  );
}
