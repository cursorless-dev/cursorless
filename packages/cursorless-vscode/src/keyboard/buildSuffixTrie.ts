import { isEqual, range, sortBy, uniqWith } from "lodash-es";
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

  /** A trie containing all possible entries, including conflicting */
  const candidateTrie = new TrieSearch<InternalEntryType<T>>("key", options);

  let id = 0;
  /** Includes an entry for every suffix of every entry in {@link entries},
   * including {@link entries} themselves, which have `isTopLevel: true` */
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

  /** This will be returned; it won't contain any conflicts */
  const finalTrie = new TrieSearch<KeyValuePair<T>>("key", options);

  /** Top-level conflicts to report to the caller */
  const conflictList: KeyValuePair<T>[][] = [];

  /**
   * The entries with these id's have conflicts and will be removed. We don't
   * report them to the user if they're not top-level, though
   */
  const badEntries = new Set<number>();

  for (const { isTopLevel, key, value, id } of candidateEntries) {
    const conflicting = candidateTrie
      .search(key)
      .filter((other) => other.value !== value);

    if (conflicting.length === 0) {
      continue;
    }

    if (isTopLevel) {
      // If we're top-level, we mark every conflicting entry as bad
      conflicting.forEach(({ id }) => badEntries.add(id));

      const conflictingTopLevel = conflicting.filter(
        ({ isTopLevel }) => isTopLevel,
      );
      if (conflictingTopLevel.length === 0) {
        // No problem if there are no top-level conflicts
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
      // If we're not top-level, we only mark other non-top-level entries as bad
      conflicting
        .filter(({ isTopLevel }) => !isTopLevel)
        .forEach(({ id }) => badEntries.add(id));
    }

    // If we got here, we have a conflict, so we mark ourselves as bad
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
