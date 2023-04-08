/**
 * Merge the input objects, throwing an error if there are any conflicts.
 */
export function mergeStrict(
  ...objs: Record<string, string>[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const obj of objs) {
    for (const [key, value] of Object.entries(obj)) {
      if (result[key] !== undefined && result[key] !== value) {
        throw new Error(
          `Conflicting versions for ${key}: ${result[key]} and ${value}`
        );
      }
      result[key] = value;
    }
  }

  return result;
}
