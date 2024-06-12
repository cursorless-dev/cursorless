import { KeyboardCommandArgTypes } from "../KeyboardCommandTypeHelpers";
import { CommandRulePostProcessor } from "./CommandRulePostProcessor";
import {
  ArgExtractor,
  Unused,
  getArgExtractors,
  constructPayload,
} from "@cursorless/cursorless-engine";

/**
 * Creates a postprocess function for a top-level rule of our grammar. This is a
 * function that takes the output of a rule and transforms it into a command
 * usable by our command handler. It does so by constructing a payload object
 * with `type` as provided in {@link type}, and `args` constructed by mapping
 * {@link argExtractors} to the values at the same positions in the parser
 * rule's output.
 *
 * We also keep metadata about the rule on the postprocess function so that we
 * can display it to the user, eg in the sidebar. The reason we keep the
 * metadata here is that the postprocess function is the only thing we have
 * control over in the nearley parser.
 *
 * The {@link argExtractors} argument can be either:
 *
 * - A function that takes the output of the parser rule and returns the
 *   command's argument payload. For example:
 *
 *   ```ts
 *   p = command("foo", (args) => ({ bar: args[0], baz: args[1] }))
 *   assert(p(["a", "b"]) === { type: "foo", arg: { bar: "a", baz: "b" } }
 *   ```
 * - An object mapping the names of the arguments to the command's argument
 *   payload to the positions of the values in the parser rule's output. For
 *   example:
 *
 *   ```ts
 *   p = command("foo", { bar: $1, baz: "hello" })
 *   assert(p(["a", "b"]) === { type: "foo", arg: { bar: "b", baz: "hello" } }
 *   ```
 *
 * - An array of the names of the arguments to the command's argument payload.
 *   For example:
 *
 *   ```ts
 *   p = command("foo", ["bar", "baz"])
 *   assert(p(["a", "b"]) === { type: "foo", arg: { bar: "a", baz: "b" } }
 *   ```
 *
 * @param type The type of the command
 * @param argExtractors The extractors to use to get the command's argument (see
 * above)
 * @returns A postprocess function for the command
 */

export function command<T extends keyof KeyboardCommandArgTypes>(
  type: T,
  argExtractors:
    | ArgExtractor<KeyboardCommandArgTypes[T]>
    | (keyof KeyboardCommandArgTypes[T] | Unused)[]
    | ((args: any[]) => KeyboardCommandArgTypes[T]),
): CommandRulePostProcessor<T> {
  let extractArgs: (args: any[]) => KeyboardCommandArgTypes[T];

  if (typeof argExtractors === "function") {
    extractArgs = argExtractors;
  } else {
    const extractors = Array.isArray(argExtractors)
      ? getArgExtractors<KeyboardCommandArgTypes[T]>(argExtractors)
      : argExtractors;
    extractArgs = (args: any[]) =>
      constructPayload(args, extractors) as KeyboardCommandArgTypes[T];
  }

  function ret(args: any[]) {
    return {
      type,
      arg: extractArgs(args),
    };
  }
  ret.metadata = { type };
  return ret;
}
