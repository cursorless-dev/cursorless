import { isEqual, range, sortBy, uniqWith } from "lodash";
import TrieSearch, { TrieSearchOptions } from "trie-search";

export interface KeyValuePair<T> {
  key: string;
  value: T;
}

interface BuildTrieReturn<T> {
  trie: TrieSearch<KeyValuePair<T>>;
  conflicts: KeyValuePair<T>[][];
}
type InternalEntryType<T> = {
  isTopLevel: boolean;
  key: string;
  value: T;
  id: number;
};

/**
 * Build a trie containing all the keymaps, as well as non-conflicting suffixes
 * of each key. Also returns a list of all the conflicting keymaps. If any key is
 * a prefix of any other key, we consider them to be conflicting.
 * @param keyMaps The keymaps to build the trie from
 * @returns The trie, and a list of conflicting keymaps
 */
export function buildSuffixTrie<T>(entries: [string, T][]): BuildTrieReturn<T> {
  const options: TrieSearchOptions<InternalEntryType<T>> &
    TrieSearchOptions<KeyValuePair<T>> = {
    splitOnRegEx: undefined,
    ignoreCase: false,
  };

  const candidateTrie = new TrieSearch<InternalEntryType<T>>("key", options);

  let id = 0;
  const candidateEntries = entries.flatMap(([fullKey, value]) =>
    range(fullKey.length).map((i) => {
      const key = fullKey.substring(i);
      return {
        isTopLevel: fullKey === key,
        key,
        value,
        id: id++,
      };
    }),
  );
  candidateTrie.addAll(candidateEntries);

  const finalTrie = new TrieSearch<KeyValuePair<T>>("key", options);

  const conflictList: KeyValuePair<T>[][] = [];
  const badEntries = new Set<number>();

  for (const { isTopLevel, key, value, id } of candidateEntries) {
    const conflicting = candidateTrie
      .search(key)
      .filter((other) => other.value !== value);

    if (conflicting.length === 0) {
      continue;
    }

    if (isTopLevel) {
      const conflictingTopLevel = conflicting.filter(
        ({ isTopLevel }) => isTopLevel,
      );
      conflicting.forEach(({ id }) => badEntries.add(id));
      if (conflictingTopLevel.length === 0) {
        continue;
      }
      conflictList.push(
        sortBy(
          [
            { key, value },
            ...conflictingTopLevel.map(({ key, value }) => ({ key, value })),
          ],
          ["key", "value"],
        ),
      );
    } else {
      conflicting
        .filter(({ isTopLevel }) => !isTopLevel)
        .forEach(({ id }) => badEntries.add(id));
    }

    badEntries.add(id);
  }

  for (const { key, value, id } of candidateEntries) {
    if (!badEntries.has(id)) {
      finalTrie.add({ key, value });
    }
  }

  return {
    trie: finalTrie,
    conflicts: uniqWith(conflictList, isEqual),
  };
}
