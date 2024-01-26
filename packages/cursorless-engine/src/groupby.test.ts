import assert from "assert";
import groupby from "./groupby";

describe("groupby", () => {
  it("should group entries based on the callback function", async () => {
    const generator = async function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    };

    const callback = (entry: number) => (entry % 2 === 0 ? "even" : "odd");

    const result = [];
    for await (const group of groupby(generator(), callback)) {
      result.push(group);
    }

    assert.equal(result, [
      [1, 3, 5],
      [2, 4],
    ]);
  });

  it("should handle empty generator", async () => {
    const generator = async function* () {};

    const callback = (entry: number) => (entry % 2 === 0 ? "even" : "odd");

    const result = [];
    for await (const group of groupby(generator(), callback)) {
      result.push(group);
    }

    assert.equal(result, []);
  });
});
