import { PredicateOperand } from "web-tree-sitter";
import z from "zod";
import { operandToString } from "./predicateToString";

export function constructZodErrorMessages(
  inputOperands: PredicateOperand[],
  error: z.ZodError<PredicateOperand[]>,
): string[] {
  return error.errors
    .filter(
      // If the user has supplied a capture instead of a string, or vice versa,
      // we'll get two errors instead of one; we prefer to show the more helpful
      // one.
      (error) =>
        !(
          error.code === "invalid_type" &&
          error.path.length === 2 &&
          (error.path[1] === "name" || error.path[1] === "value")
        ),
    )
    .map((error) => getErrorMessage(inputOperands, error));
}

function getErrorMessage(inputOperands: PredicateOperand[], error: z.ZodIssue) {
  if (error.path.length === 0) {
    if (error.code === "too_small") {
      return "Too few arguments";
    } else if (error.code === "too_big") {
      return "Too many arguments";
    }

    return error.message;
  }

  let message = error.message;

  if (error.code === "invalid_literal" && error.path[1] === "type") {
    message =
      error.expected === "capture"
        ? "Capture names must be prefixed with @"
        : "Expected string, but received capture";
  }

  const argIndex = error.path[0] as number;
  const operandString = operandToString(inputOperands[argIndex]);
  return `Error on argument ${argIndex} (\`${operandString}\`): ${message}`;
}
