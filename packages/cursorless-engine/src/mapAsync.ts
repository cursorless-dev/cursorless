/**
 * Given an async generator and a callback, returns an async generator that
 * applies the callback to each entry in the original generator and yields the
 * result.
 * @param generator The generator to map
 * @param callback The callback to apply to each entry
 * @returns An async generator that yields the result of applying the callback
 */
export async function* mapAsync<T, K>(
  generator: AsyncGenerator<T>,
  callback: (entry: T) => K,
): AsyncGenerator<K> {
  for await (const entry of generator) {
    yield callback(entry);
  }
}
