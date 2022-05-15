import { TestCaseFixture } from "../../../testUtil/TestCase";
import { transformPartialPrimitiveTargets } from "../../../util/getPrimitiveTargets";
import {
  DelimiterInclusion,
  PartialPrimitiveTarget,
} from "../../../typings/target.types";

// Leaving an example here in case it's helpful
export function updateSurroundingPairTest(fixture: TestCaseFixture) {
  fixture.command.targets = transformPartialPrimitiveTargets(
    fixture.command.targets,
    (target: PartialPrimitiveTarget) => {
      target.modifiers?.forEach((modifier) => {
        if (modifier?.type === "surroundingPair") {
          let delimiterInclusion: DelimiterInclusion;

          switch (modifier.delimiterInclusion as any) {
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

          modifier.delimiterInclusion = delimiterInclusion;
        }
      });

      return target;
    }
  );

  return fixture;
}
