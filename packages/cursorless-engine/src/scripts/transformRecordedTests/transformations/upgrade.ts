import {
  CommandVersion,
  LATEST_VERSION,
  TestCaseFixtureLegacy,
} from "@cursorless/common";
import { upgradeCommand } from "../../../core/commandVersionUpgrades/canonicalizeAndValidateCommand";

export function upgrade(
  fixture: TestCaseFixtureLegacy,
  minimumVersion: CommandVersion = LATEST_VERSION,
): TestCaseFixtureLegacy {
  return {
    ...fixture,
    command: upgradeCommand(fixture.command, minimumVersion),
  };
}
