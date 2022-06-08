import { flow } from "lodash";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { TestCaseFixture } from "../../../testUtil/TestCase";
import { reorderFields } from "./reorderFields";
import { upgradeFromVersion0 } from "./upgradeFromVersion0";

export const upgrade = flow(upgradeFromVersion0, upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand
  )(fixture.command);

  return fixture;
}
