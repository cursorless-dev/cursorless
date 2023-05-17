import { TestCaseFixture, TestCaseFixtureLegacy } from "@cursorless/common";
import { flow } from "lodash";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { cleanUpTestCaseCommand } from "../../../testUtil/cleanUpTestCaseCommand";
import { reorderFields } from "./reorderFields";

export const upgrade = flow(upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixtureLegacy): TestCaseFixture {
  return {
    ...fixture,
    command: flow(
      canonicalizeAndValidateCommand,
      cleanUpTestCaseCommand,
    )(fixture.command),
  };
}
