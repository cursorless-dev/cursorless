interface IteratorInfo<T> {
  iterator: Iterator<T>;
  value: T;
}
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
export function advanceIteratorsUntil<T>(
  iteratorInfos: IteratorInfo<T>[],
  criterion: (arg: T) => boolean,
): IteratorInfo<T>[] {
  return iteratorInfos.flatMap((iteratorInfo) => {
    const { iterator } = iteratorInfo;
    let { value } = iteratorInfo;

    let done: boolean | undefined = false;
    while (!criterion(value) && !done) {
      ({ value, done } = iterator.next());
    }

    if (done) {
      return [];
    }

    return [{ iterator, value }];
  });
}
