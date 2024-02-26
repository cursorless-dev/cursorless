export async function asyncIteratorToList<T>(
  iterator: AsyncIterable<T>,
): Promise<T[]> {
  const list: T[] = [];
  for await (const item of iterator) {
    list.push(item);
  }
  return list;
}
