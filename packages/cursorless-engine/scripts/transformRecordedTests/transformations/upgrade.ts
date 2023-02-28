import { flow } from "lodash";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { TestCaseFixture } from "@cursorless/common";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { reorderFields } from "./reorderFields";

export const upgrade = flow(upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand,
  )(fixture.command);

  return fixture;
}
