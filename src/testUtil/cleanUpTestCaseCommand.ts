import { TestCaseCommand } from "./TestCase";

export function cleanUpTestCaseCommand(
  command: TestCaseCommand
): TestCaseCommand {
  const { extraArgs, usePrePhraseSnapshot, ...rest } = command;

  return {
    ...rest,
    extraArgs:
      extraArgs == null
        ? undefined
        : extraArgs.length === 0
        ? undefined
        : extraArgs,
  };
}
