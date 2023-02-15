import { flow } from "lodash";
import { canonicalizeAndValidateCommand } from "../../../libs/cursorless-engine/core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { TestCaseFixture } from "../../../testUtil/TestCaseFixture";
import { reorderFields } from "./reorderFields";

export const upgrade = flow(upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand,
  )(fixture.command);

  return fixture;
}
