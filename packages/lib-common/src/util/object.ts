/**
 * Merges all objects passed in by key, raising an exception if any two objects share a key
 * @param objects The objects to merge
 * @returns The merged object
 */
export function mergeStrict<Value>(
  ...objects: Record<string, Value>[]
): Record<string, Value> {
  const returnValue: Record<string, Value> = {};

  objects.forEach((object: object) => {
    for (const [key, value] of Object.entries(object)) {
      if (Object.prototype.hasOwnProperty.call(returnValue, key)) {
        throw new Error(`Found duplicate property ${key}`);
      }

      returnValue[key] = value;
    }
  });

  return returnValue;
}

/**
 * `Object.keys` but returns an array of the keys TypeScript knows about.
 *
 * Note that this is technically unsound, as TypeScript is a structural type system.
 * Consider the following example (from ts-reset's docs):
 * ```
 * type Func = () => { id: string };
 *
 * const func: Func = () => {
 *   return {
 *     id: "123",
 *     // No error on an excess property!
 *     name: "Hello!",
 *   }
 * };
 * ```
 *
 * Consider only using this on objects frozen at construction time
 * or locals that don't escape the calling scope.
 */
export function unsafeKeys<T extends object>(o: T): (keyof T)[] {
  return Object.keys(o) as (keyof T)[];
}
