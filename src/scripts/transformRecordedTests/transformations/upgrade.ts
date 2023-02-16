import { flow } from "lodash";
import { canonicalizeAndValidateCommand } from "../../../packages/cursorless-engine/core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { cleanUpTestCaseCommand } from "../../../packages/cursorless-engine/testUtil/cleanUpTestCaseCommand";
import { TestCaseFixture } from "../../../packages/cursorless-engine/testCaseRecorder/TestCaseFixture";
import { reorderFields } from "./reorderFields";

export const upgrade = flow(upgradeCommand, reorderFields);

function upgradeCommand(fixture: TestCaseFixture) {
  fixture.command = flow(
    canonicalizeAndValidateCommand,
    cleanUpTestCaseCommand,
  )(fixture.command);

  return fixture;
}
