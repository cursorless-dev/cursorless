import * as assert from "assert";
import * as fc from "fast-check";
import { uniqWith } from "lodash-es";
import { uniqWithHash } from "./uniqWithHash";

// known good but slow (quadratic!)
function knownGoodUniqWithHash<T>(
  array: T[],
  fn: (a: T, b: T) => boolean,
  _: (t: T) => string,
): T[] {
  return uniqWith(array, fn);
}

suite("uniqWithHash", () => {
  test("uniqWithHash", () => {
    // believe it or not, all these test cases are important
    const testCases: number[][] = [
      [],
      [0],
      [1],
      [0, 1],
      [1, 0],
      [0, 0],
      [1, 1],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [0, 1, 2, 3],
      [0, 1, 2, 3, 0, 1, 2, 3],
      [0, 0, 1, 1, 2, 2, 3, 3],
      [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
      [0, 0, 1, 1, 2, 2, 3, 3, 0, 0, 1, 1, 2, 2, 3, 3],
      [0, 1, 2, 3, 4, 5, 0, 1, 2, 3],
      [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 0, 1, 2, 3],
      [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
      [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
    ];

    const hashFunctions = [
      (x: number) => x.toString(),
      (x: number) => (x % 2).toString(),
      (_: number) => "0",
    ];

    hashFunctions.forEach((hash) => {
      const check = (testCase: number[]) => {
        const actual = uniqWithHash(testCase, (a, b) => a === b, hash);
        const expected = knownGoodUniqWithHash(
          testCase,
          (a, b) => a === b,
          hash,
        );
        assert.deepStrictEqual(actual, expected);
      };

      testCases.forEach(check);

      // max length 50 because the known good implementation is quadratic
      const randomNumbers = fc.array(fc.integer(), { maxLength: 50 });
      fc.assert(fc.property(randomNumbers, check));
    });
  });
});
