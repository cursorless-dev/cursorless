/**
 * Given an async generator and a callback, returns an async generator that
 * yields groups of items from the original generator, where each group contains
 * those entries that have the same value for the callback.
 *
 * For example, if the original generator yields the following entries:
 *
 *  { date: "2021-01-01", command: "foo" }
 *  { date: "2021-01-01", command: "bar" }
 *  { date: "2021-01-02", command: "baz" }
 *  { date: "2021-01-02", command: "qux" }
 *
 * and the callback is `entry => entry.date`, then the returned generator will
 * yield the following groups:
 *
 * [
 *  { date: "2021-01-01", command: "foo" },
 *  { date: "2021-01-01", command: "bar" },
 * ],
 * [
 *  { date: "2021-01-02", command: "baz" },
 *  { date: "2021-01-02", command: "qux" },
 * ]
 *
 * @param generator The generator to group
 * @param callback The callback to use to determine which entries are in the same group
 * @returns An async generator that yields groups of entries
 */
export default async function* groupby<T, K>(
  generator: AsyncGenerator<T>,
  callback: (entry: T) => K,
): AsyncGenerator<[K, T[]]> {
  const groups = new Map<K, T[]>();
  const keys: K[] = [];

  for await (const entry of generator) {
    const key = callback(entry);
    const group = groups.get(key) ?? [];
    group.push(entry);
    if (!groups.has(key)) {
      groups.set(key, group);
      keys.push(key);
    }
  }

  for (const pair of groups.entries()) {
    yield pair;
  }
}
