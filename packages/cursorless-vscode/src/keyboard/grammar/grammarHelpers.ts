import { isString } from "lodash";
import { KeyboardCommandArgTypes } from "../KeyboardCommandTypeHelpers";
import { CommandRulePostProcessor } from "./CommandRulePostProcessor";

export const UNUSED = Symbol("unused");
export type Unused = typeof UNUSED;

/**
 * @param args The values output by the parser rule
 * @param argExtractors Extractors to get values for payload
 * @returns An object with the given keys mapped to the values at the same
 * positions in the parser rule's output
 */
function constructPayload<K>(
  args: any[],
  argExtractors: KeyboardArgExtractor<K>,
): Record<keyof K, any> {
  const arg: Partial<Record<keyof K, any>> = {};
  for (const [key, value] of Object.entries(argExtractors)) {
    if (value instanceof ArgPosition) {
      arg[key as keyof K] = args[value.position];
    } else {
      arg[key as keyof K] = value;
    }
  }
  return arg as Record<keyof K, any>;
}

class ArgPosition {
  constructor(public position: number) {}
}

export const argPositions: Record<string, ArgPosition> = {
  $0: new ArgPosition(0),
  $1: new ArgPosition(1),
  $2: new ArgPosition(2),
  $3: new ArgPosition(3),
  $4: new ArgPosition(4),
  $5: new ArgPosition(5),
};

type KeyboardArgExtractor<T> = {
  [K in keyof T]: T[K] | ArgPosition;
};

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
    | KeyboardArgExtractor<KeyboardCommandArgTypes[T]>
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

function getArgExtractors<T>(argExtractors: (keyof T | typeof UNUSED)[]): T {
  return Object.fromEntries(
    argExtractors
      .map((arg, i) => [arg, new ArgPosition(i)])
      .filter(([arg]) => arg !== UNUSED),
  );
}

/**
 * Creates a postprocess function for a lower-level capture in our keyboard
 * grammar. The output will be an object with the keys of {@link argNames}
 * mapped to the values at the same positions in the parser rule's output.
 *
 * For example:
 *
 * ```ts
 * const processor = capture("foo", "bar");
 * processor(["a", "b"]) === { foo: "a", bar: "b" }
 * ```
 *
 * When used in a parser rule, it would look like:
 *
 * ```nearley
 * foo -> bar baz {% capture("bar", "baz") %}
 * ```
 *
 * Then if the rule matched with tokens 0 then 1, the output would be:
 *
 * ```ts
 * { bar: 0, baz: 1 }
 * ```
 *
 * @param argExtractor The extractors to use to get the argument payload
 * @returns A postprocess function that constructs a payload with the given keys
 * mapped to the values at the same positions in the parser rule's output
 */
export function capture(
  argExtractor: KeyboardArgExtractor<Record<string, any>>,
): (args: any[]) => Record<string, any>;
export function capture(
  ...argNames: (string | Unused)[]
): (args: any[]) => Record<string, any>;
export function capture(
  arg0: (string | Unused) | KeyboardArgExtractor<Record<string, any>>,
  ...argNames: (string | Unused)[]
): (args: any[]) => Record<string, any> {
  const extractors =
    isString(arg0) || arg0 === UNUSED
      ? getArgExtractors([arg0, ...argNames])
      : arg0;

  return (args: any[]) => constructPayload(args, extractors);
}
