import { TestCaseFixture } from "../../../testUtil/TestCase";
import { canonicalizeAndValidateCommand } from "../../../util/canonicalizeAndValidateCommand";
import { flow } from "lodash";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { upgradeFromVersion0 } from "./upgradeFromVersion0";
import { reorderFields } from "./reorderFields";

export const upgrade = flow(upgradeFromVersion0, upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand
  )(fixture.command);

  return fixture;
}
