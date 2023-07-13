import { TestCaseFixture, TestCaseFixtureLegacy } from "@cursorless/common";
import { flow } from "lodash";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { reorderFields } from "./reorderFields";

export const upgrade = flow(upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixtureLegacy): TestCaseFixture {
  return {
    ...fixture,
    command: canonicalizeAndValidateCommand(fixture.command),
  };
}
