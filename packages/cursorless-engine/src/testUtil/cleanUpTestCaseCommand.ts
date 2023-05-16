import { CommandLatest } from "@cursorless/common";
import { merge } from "lodash";

export function cleanUpTestCaseCommand(command: CommandLatest): CommandLatest {
  const { args } = command.action;
  const result = merge({}, command);
  if (args == null || args.length === 0) {
    result.action.args = undefined;
  }
  return result;
}
