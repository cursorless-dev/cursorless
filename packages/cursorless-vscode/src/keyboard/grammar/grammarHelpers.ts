import { KeyboardCommandArgTypes } from "../KeyboardCommandTypeHelpers";
import { CommandRulePostProcessor } from "./CommandRulePostProcessor";

export const UNUSED = Symbol("unused");
export type Unused = typeof UNUSED;

/**
 * @param args The values output by the parser rule
 * @param argNames The keys to use for the payload
 * @returns An object with the given keys mapped to the values at the same
 * positions in the parser rule's output
 */
function constructPayload(args: any[], argNames: (string | Unused)[]) {
  const arg: Record<string, any> = {};
  for (let i = 0; i < argNames.length; i++) {
    const name = argNames[i];
    if (name === UNUSED) {
      continue;
    }
    arg[name] = args[i];
  }
  return arg;
}

/**
 * Creates a postprocess function for a top-level rule of our grammar. This is a
 * function that takes the output of a rule and transforms it into a command
 * usable by our command handler. It does so by constructing a payload object
 * with `type` as provided in {@link type}, and `args` constructed by mapping
 * {@link argNames} to the values at the same positions in the parser rule's
 * output.
 *
 * We also keep metadata about the rule on the
 * postprocess function so that we can display it to the user, eg in the
 * sidebar. The reason we keep the metadata here is that the postprocess
 * function is the only thing we have control over in the nearley parser.
 *
 * @param type The type of the command
 * @param argNames The names of the arguments to the command's argument payload
 * @returns A postprocess function for the command
 */
export function command<T extends keyof KeyboardCommandArgTypes>(
  type: T,
  argNames: (keyof KeyboardCommandArgTypes[T] | Unused)[],
): CommandRulePostProcessor<T> {
  function ret(args: any[]) {
    return {
      type,
      arg: constructPayload(
        args,
        argNames as (string | Unused)[],
      ) as KeyboardCommandArgTypes[T],
    };
  }
  ret.metadata = { type, argNames };
  return ret;
}

/**
 * Creates a postprocess function for a lower-level capture in our keyboard
 * grammar. The output will be an object with the keys of {@link argNames}
 * mapped to the values at the same positions in the parser rule's output.
 *
 * @param argNames The keys to use for the payload
 * @returns A postprocess function that constructs a payload with the given keys
 * mapped to the values at the same positions in the parser rule's output
 */
export function capture(...argNames: (string | Unused)[]) {
  function ret(args: any[]) {
    return constructPayload(args, argNames);
  }
  return ret;
}
