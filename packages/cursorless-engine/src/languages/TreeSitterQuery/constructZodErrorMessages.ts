import type { PredicateStep } from "web-tree-sitter";
import type { z } from "zod";
import { operandToString } from "./predicateToString";

export function constructZodErrorMessages(
  inputOperands: PredicateStep[],
  error: z.ZodError<z.core.output<PredicateStep[]>>,
): string[] {
  return error.issues
    .filter(
      // If the user has supplied a capture instead of a string, or vice versa,
      // we'll get two issues instead of one; we prefer to show the more helpful
      // one.
      (issue) =>
        !(
          issue.code === "invalid_type" &&
          issue.path.length === 2 &&
          (issue.path[1] === "name" || issue.path[1] === "value")
        ),
    )
    .map((issue) => getErrorMessage(inputOperands, issue));
}

function getErrorMessage(
  inputOperands: PredicateStep[],
  issue: z.core.$ZodIssue,
) {
  if (issue.path.length === 0) {
    if (issue.code === "too_small") {
      return "Too few arguments";
    } else if (issue.code === "too_big") {
      return "Too many arguments";
    }

    return issue.message;
  }

  const argIndex = issue.path[0] as number;

  if (argIndex >= inputOperands.length) {
    return "Too few arguments";
  }

  let message = issue.message;

  if (issue.code === "invalid_value" && issue.path[1] === "type") {
    message =
      issue.values[0] === "capture"
        ? "Capture names must be prefixed with @"
        : "Expected string, but received capture";
  }

  const operandString = operandToString(inputOperands[argIndex]);
  return `Error on argument ${argIndex} (\`${operandString}\`): ${message}`;
}
