import { TestCaseCommand } from "./TestCase";

export function cleanUpTestCaseCommand(
  command: TestCaseCommand,
): TestCaseCommand {
  const { action, ...rest } = command;
  const { args } = action;

  return {
    ...rest,
    action: {
      ...action,
      args: args == null ? undefined : args.length === 0 ? undefined : args,
    },
  };
}
