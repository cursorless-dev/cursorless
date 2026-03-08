import type { TestCaseFixtureLegacy } from "../types/TestCaseFixture";
import type { ActionDescriptor } from "../types/command/ActionDescriptor";
import type { CommandV7 } from "../types/command/CommandV7.types";
import type { Command } from "../types/command/command.types";
import type { EnforceUndefined } from "../util/typeUtils";
import { serialize } from "./serialize";

function reorderFields(
  fixture: TestCaseFixtureLegacy,
): EnforceUndefined<TestCaseFixtureLegacy> {
  return {
    languageId: fixture.languageId,
    focusedElementType: fixture.focusedElementType,
    postEditorOpenSleepTimeMs: fixture.postEditorOpenSleepTimeMs,
    postCommandSleepTimeMs: fixture.postCommandSleepTimeMs,
    command: reorderCommandFields(fixture.command),
    spokenFormError: fixture.spokenFormError,
    marksToCheck: fixture.marksToCheck,
    initialState: fixture.initialState,
    finalState: fixture.finalState,
    returnValue: fixture.returnValue,
    fallback: fixture.fallback,
    thrownError: fixture.thrownError,
    ide: fixture.ide,
  };
}

function reorderCommandFields(command: Command): Command {
  switch (command.version) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      throw new Error("All tests must use at least command version 7");
    case 7:
      return reorderCommandV7Fields(command);
  }
}

function reorderCommandV7Fields(
  command: CommandV7,
): EnforceUndefined<CommandV7> {
  return {
    version: command.version,
    spokenForm: command.spokenForm,
    action: reorderActionFields(command.action),
    usePrePhraseSnapshot: command.usePrePhraseSnapshot,
  };
}

function reorderActionFields(action: ActionDescriptor): ActionDescriptor {
  const { name, ...rest } = action;
  return {
    name,
    ...rest,
  } as ActionDescriptor;
}

export function serializeTestFixture(fixture: TestCaseFixtureLegacy): string {
  return serialize(reorderFields(fixture));
}
