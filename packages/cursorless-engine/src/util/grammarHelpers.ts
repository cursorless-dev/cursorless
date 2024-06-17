import { isString } from "lodash";

export const UNUSED = Symbol("unused");
export type Unused = typeof UNUSED;

/**
 * @param args The values output by the parser rule
 * @param argExtractors Extractors to get values for payload
 * @returns An object with the given keys mapped to the values at the same
 * positions in the parser rule's output
 */
export function constructPayload<K>(
  args: any[],
  argExtractors: ArgExtractor<K>,
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
};

export type ArgExtractor<T> = {
  [K in keyof T]: T[K] | ArgPosition;
};

export function getArgExtractors<T>(
  argExtractors: (keyof T | typeof UNUSED)[],
): T {
  return Object.fromEntries(
    argExtractors
      .map((arg, i) => [arg, new ArgPosition(i)])
      .filter(([arg]) => arg !== UNUSED),
  );
}

/**
 * Creates a postprocess function for a lower-level capture in our grammar. The
 * output will be an object with the keys of {@link argNames} mapped to the
 * values at the same positions in the parser rule's output.
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
  argExtractor: ArgExtractor<Record<string, any>>,
): (args: any[]) => Record<string, any>;
export function capture(
  ...argNames: (string | Unused)[]
): (args: any[]) => Record<string, any>;
export function capture(
  arg0: (string | Unused) | ArgExtractor<Record<string, any>>,
  ...argNames: (string | Unused)[]
): (args: any[]) => Record<string, any> {
  const extractors =
    isString(arg0) || arg0 === UNUSED
      ? getArgExtractors([arg0, ...argNames])
      : arg0;

  return (args: any[]) => constructPayload(args, extractors);
}
