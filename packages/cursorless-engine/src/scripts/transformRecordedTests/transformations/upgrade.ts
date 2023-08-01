import { TestCaseFixture, TestCaseFixtureLegacy } from "@cursorless/common";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";

export function upgrade(fixture: TestCaseFixtureLegacy): TestCaseFixture {
  return {
    ...fixture,
    command: canonicalizeAndValidateCommand(fixture.command),
  };
}
