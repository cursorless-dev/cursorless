import type { TestCaseFixtureLegacy } from "../types/TestCaseFixture";
import type { ActionDescriptor } from "../types/command/ActionDescriptor";
import type { CommandV6 } from "../types/command/legacy/CommandV6.types";
import type { CommandV7 } from "../types/command/legacy/CommandV7.types";
import type { Command } from "../types/command/command.types";
import type { CommandV5 } from "../types/command/legacy/CommandV5.types";
import type { EnforceUndefined } from "../util/typeUtils";
import { serialize } from "./serialize";
import type { ActionDescriptorV6 } from "../types/command/legacy/ActionDescriptorV6";

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
      throw new Error("All tests must use at least command version 5");
    case 5:
      return reorderCommandV5Fields(command);
    case 6:
      return reorderCommandV6Fields(command);
    case 7:
      return reorderCommandV7Fields(command);
    case 8:
      return command;
  }
}

function reorderCommandV5Fields(
  command: CommandV5,
): EnforceUndefined<CommandV5> {
  return {
    version: command.version,
    spokenForm: command.spokenForm,
    action: {
      name: command.action.name,
      args: command.action.args,
    },
    targets: command.targets,
    usePrePhraseSnapshot: command.usePrePhraseSnapshot,
  };
}

function reorderCommandV6Fields(
  command: CommandV6,
): EnforceUndefined<CommandV6> {
  return {
    version: command.version,
    spokenForm: command.spokenForm,
    action: reorderActionFields(command.action),
    usePrePhraseSnapshot: command.usePrePhraseSnapshot,
  };
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

function reorderActionFields(action: ActionDescriptorV6): ActionDescriptor {
  const { name, ...rest } = action;
  return {
    name,
    ...rest,
  } as ActionDescriptor;
}

export function serializeTestFixture(fixture: TestCaseFixtureLegacy): string {
  return serialize(reorderFields(fixture));
}
