import { isPlainObject } from "lodash";

/**
 * Like lodash.omitBy, but also omits values from nested objects
 * @param input An object to omit values from
 * @param predicate A function that returns true if the value should be omitted
 * @returns A new object without the omitted values
 */
export function omitByDeep(
  input: unknown,
  predicate: (value: unknown) => boolean,
): unknown {
  if (Array.isArray(input)) {
    return input.map((value) => omitByDeep(value, predicate));
  } else if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input as object)
        .map(([key, value]) => {
          if (predicate(value)) {
            return undefined;
          } else {
            return [key, omitByDeep(value, predicate)];
          }
        })
        .filter((v): v is [string, unknown] => v != null),
    );
  } else {
    return input;
  }
}
