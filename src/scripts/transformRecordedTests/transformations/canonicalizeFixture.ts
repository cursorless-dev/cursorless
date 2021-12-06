import { TestCaseFixture } from "../../../testUtil/TestCase";
import { canonicalizeAndValidateCommand } from "../../../util/canonicalizeAndValidateCommand";
import { flow } from "lodash";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { upgradeFromVersion0 } from "./upgradeFromVersion0";
import { reorderFields } from "./reorderFields";

export const canonicalizeFixture = flow(
  upgradeFromVersion0,
  canonicalizeCommand,
  reorderFields
);

function canonicalizeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand
  )(fixture.command);

  return fixture;
}
