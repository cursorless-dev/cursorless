import type {
  CommandVersion,
  TestCaseFixtureLegacy} from "@cursorless/common";
import {
  LATEST_VERSION
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
