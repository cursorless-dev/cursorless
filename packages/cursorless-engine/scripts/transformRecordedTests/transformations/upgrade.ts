import { flow } from "lodash";
import { TestCaseFixture } from "@cursorless/cursorless-engine";
import { reorderFields } from "./reorderFields";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";

export const upgrade = flow(upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand,
  )(fixture.command);

  return fixture;
}
