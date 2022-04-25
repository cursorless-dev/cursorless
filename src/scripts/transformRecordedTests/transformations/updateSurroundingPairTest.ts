import { TestCaseFixture } from "../../../testUtil/TestCase";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";
import {
  DelimiterInclusion,
  PartialPrimitiveTarget,
} from "../../../typings/Types";

// Leaving an example here in case it's helpful
export function updateSurroundingPairTest(fixture: TestCaseFixture) {
  fixture.command.targets = transformPartialPrimitiveTargets(
    fixture.command.targets,
    (target: PartialPrimitiveTarget) => {
      if (target.modifier?.type === "surroundingPair") {
        let delimiterInclusion: DelimiterInclusion;

        switch (target.modifier.delimiterInclusion as any) {
          case "includeDelimiters":
            delimiterInclusion = undefined;
            break;
          case "excludeDelimiters":
            delimiterInclusion = "interiorOnly";
            break;
          case "delimitersOnly":
            delimiterInclusion = "excludeInterior";
            break;
        }

        target.modifier.delimiterInclusion = delimiterInclusion;
      }
      return target;
    }
  );

  return fixture;
}
