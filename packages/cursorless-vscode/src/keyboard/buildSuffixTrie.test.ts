import assert from "node:assert";
import { KeyValuePair, buildSuffixTrie } from "./buildSuffixTrie";
import { isEqual, sortBy, uniq, uniqWith } from "lodash";

interface TestCase {
  input: string[];
  expected: KeyValuePair<string>[];
  expectedConflicts?: KeyValuePair<string>[][];
}

const testCases: TestCase[] = [
  {
    input: ["a", "b", "c"],
    expected: [
      { key: "a", value: "a" },
      { key: "b", value: "b" },
      { key: "c", value: "c" },
    ],
  },
  {
    input: ["ab", "c"],
    expected: [
      { key: "ab", value: "ab" },
      { key: "b", value: "ab" },
      { key: "c", value: "c" },
    ],
  },
  {
    input: ["ab", "b"],
    expected: [
      { key: "ab", value: "ab" },
      { key: "b", value: "b" },
    ],
  },
  {
    input: ["a", "ab"],
    expected: [{ key: "b", value: "ab" }],
    expectedConflicts: [
      [
        { key: "a", value: "a" },
        { key: "ab", value: "ab" },
      ],
    ],
  },
  {
    input: ["ab", "cbd"],
    expected: [
      { key: "ab", value: "ab" },
      { key: "cbd", value: "cbd" },
      { key: "d", value: "cbd" },
    ],
  },
  {
    input: ["a", "bac"],
    expected: [
      { key: "a", value: "a" },
      { key: "bac", value: "bac" },
      { key: "c", value: "bac" },
    ],
  },
  {
    input: ["az", "bz", "c"],
    expected: [
      { key: "az", value: "az" },
      { key: "bz", value: "bz" },
      { key: "c", value: "c" },
    ],
  },
  {
    input: ["ab", "cde", "cxe"],
    expected: [
      { key: "ab", value: "ab" },
      { key: "b", value: "ab" },
      { key: "cde", value: "cde" },
      { key: "de", value: "cde" },
      { key: "cxe", value: "cxe" },
      { key: "xe", value: "cxe" },
    ],
  },
  {
    input: ["ab", "ac"],
    expected: [
      { key: "ab", value: "ab" },
      { key: "ac", value: "ac" },
      { key: "b", value: "ab" },
      { key: "c", value: "ac" },
    ],
  },
  {
    input: ["aa"],
    expected: [
      { key: "aa", value: "aa" },
      { key: "a", value: "aa" },
    ],
  },
  {
    input: ["a", "A"],
    expected: [
      { key: "a", value: "a" },
      { key: "A", value: "A" },
    ],
  },
];

suite("buildSuffixTrie", () => {
  testCases.forEach(({ input, expected, expectedConflicts }) => {
    test(`input: ${input}`, () => {
      const { trie, conflicts } = buildSuffixTrie<string>(
        input.map((key) => [key, key]),
      );
      const chars = uniq(input.flatMap((key) => key.split(""))).sort();
      const actual = uniqWith(
        sortEntries(chars.flatMap((char) => trie.search(char))),
        isEqual,
      );
      assert.deepStrictEqual(actual, sortEntries(expected));
      assert.deepStrictEqual(
        sortBy(conflicts.map(sortEntries), (conflict) =>
          JSON.stringify(conflict),
        ),
        (expectedConflicts ?? []).map(sortEntries),
      );
    });
  });
});

function sortEntries(entries: KeyValuePair<string>[]) {
  return sortBy(entries, ["key", "value"]);
}
