import { TestCaseFixture, TestCaseFixtureLegacy } from "@cursorless/common";
import { canonicalizeAndValidateCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";

export function canonicalize(fixture: TestCaseFixtureLegacy): TestCaseFixture {
  return {
    ...fixture,
    command: canonicalizeAndValidateCommand(fixture.command),
  };
}
