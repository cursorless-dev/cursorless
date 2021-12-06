import { TestCaseFixture } from "../../../testUtil/TestCase";
import { canonicalizeAndValidateCommand } from "../../../util/canonicalizeAndValidateCommand";
import { flowRight } from "lodash";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { upgradeFromVersion0 } from "./upgradeFromVersion0";
import { reorderFields } from "./reorderFields";

export const canonicalizeFixture = flowRight(
  upgradeFromVersion0,
  canonicalizeCommand,
  reorderFields
);
function canonicalizeCommand(fixture: TestCaseFixture) {
  fixture.command = flowRight(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand
  )(fixture.command);

  return fixture;
}
