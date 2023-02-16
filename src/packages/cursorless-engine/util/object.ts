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
