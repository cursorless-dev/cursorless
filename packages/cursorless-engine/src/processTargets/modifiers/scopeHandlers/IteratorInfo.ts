/**
 * Allows us to keep track of an iterator along with the most recently yielded
 * value
 */
interface IteratorInfo<T> {
  iterator: Iterator<T>;
  value: T;
}

/**
 * Asks each iterator for its first value, and constructs {@link IteratorInfo}s
 * to keep track of iterators along with their values, pruning any iterators
 * that didn't yield a first value.
 * @param iterators The iterators to keep track of
 * @returns A list of {@link IteratorInfo}s containing each iterator along with
 * the first yielded value, removing any iterators that didn't yield a first
 * value
 */
export function getInitialIteratorInfos<T>(
  iterators: Iterator<T>[],
): IteratorInfo<T>[] {
  return iterators.flatMap((iterator) => {
    const { value, done } = iterator.next();
    return done
      ? []
      : [
          {
            iterator,
            value,
          },
        ];
  });
}

/**
 * Advances each iterator until {@link criterion} is `true`, pruning iterators
 * that terminate without {@link criterion} becoming `true`.
 *
 * @param iteratorInfos A list of iterator infos
 * @param criterion The criterion to check
 * @returns A new set of iterator infos that have been advanced until
 * {@link criterion} is `true`.  Any iterators that terminate without meeting
 * {@link criterion} are removed
 */
export function advanceIteratorsUntil<T>(
  iteratorInfos: IteratorInfo<T>[],
  criterion: (arg: T) => boolean,
): IteratorInfo<T>[] {
  return iteratorInfos.flatMap((iteratorInfo) => {
    const { iterator } = iteratorInfo;
    let { value } = iteratorInfo;

    let done: boolean | undefined = false;
    while (!done && !criterion(value)) {
      ({ value, done } = iterator.next());
    }

    if (done) {
      return [];
    }

    return [{ iterator, value }];
  });
}
