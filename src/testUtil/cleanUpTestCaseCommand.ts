import { TestCaseCommand } from "./TestCase";
import { merge } from "lodash";

export function cleanUpTestCaseCommand(
  command: TestCaseCommand
): TestCaseCommand {
  const { args } = command.action;
  const result = merge({}, command);
  result.action.args =
    args == null ? undefined : args.length === 0 ? undefined : args;
  return result;
}
