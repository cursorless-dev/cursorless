import * as assert from "assert";
import { Position, Range } from "..";

suite("Range", () => {
  test("constructor", () => {
    assert.equal(new Range(5, 0, 10, 0).start.line, 5);
    assert.equal(new Range(0, 5, 0, 10).start.character, 5);
    assert.equal(new Range(0, 0, 5, 0).end.line, 5);
    assert.equal(new Range(0, 0, 0, 5).end.character, 5);
    assert.equal(new Range(5, 0, 0, 0).start.line, 0);
    assert.equal(new Range(0, 5, 0, 0).start.character, 0);
    assert.equal(new Range(5, 0, 0, 0).end.line, 5);
    assert.equal(new Range(0, 5, 0, 0).end.character, 5);
    assert.ok(
      new Range(new Position(1, 2), new Position(3, 4)).isRangeEqual(
        new Range(1, 2, 3, 4),
      ),
    );
  });

  test("isEmpty", () => {
    assert.ok(new Range(0, 0, 0, 0).isEmpty);
    assert.ok(!new Range(0, 0, 1, 0).isEmpty);
    assert.ok(!new Range(0, 0, 0, 1).isEmpty);
  });

  test("isSingleLine", () => {
    assert.ok(new Range(0, 0, 0, 0).isSingleLine);
    assert.ok(new Range(0, 0, 0, 1).isSingleLine);
    assert.ok(new Range(0, 1, 0, 2).isSingleLine);
    assert.ok(!new Range(0, 0, 1, 0).isSingleLine);
    assert.ok(!new Range(1, 0, 2, 0).isSingleLine);
  });

  test("isRangeEqual", () => {
    assert.ok(new Range(0, 0, 0, 0).isRangeEqual(new Range(0, 0, 0, 0)));
    assert.ok(new Range(1, 0, 0, 0).isRangeEqual(new Range(1, 0, 0, 0)));
    assert.ok(new Range(0, 1, 0, 0).isRangeEqual(new Range(0, 1, 0, 0)));
    assert.ok(new Range(0, 0, 1, 0).isRangeEqual(new Range(0, 0, 1, 0)));
    assert.ok(new Range(0, 0, 0, 1).isRangeEqual(new Range(0, 0, 0, 1)));
    assert.ok(!new Range(0, 0, 0, 0).isRangeEqual(new Range(1, 0, 0, 0)));
    assert.ok(!new Range(0, 0, 0, 0).isRangeEqual(new Range(0, 1, 0, 0)));
    assert.ok(!new Range(0, 0, 0, 0).isRangeEqual(new Range(0, 0, 1, 0)));
    assert.ok(!new Range(0, 0, 0, 0).isRangeEqual(new Range(0, 0, 0, 1)));
  });

  test("contains", () => {
    assert.ok(new Range(0, 0, 0, 0).contains(new Range(0, 0, 0, 0)));
    assert.ok(new Range(0, 0, 4, 0).contains(new Range(1, 0, 2, 0)));
    assert.ok(new Range(0, 0, 0, 4).contains(new Range(0, 1, 0, 2)));
    assert.ok(new Range(0, 0, 0, 4).contains(new Range(0, 2, 0, 4)));
    assert.ok(new Range(0, 0, 4, 0).contains(new Range(2, 0, 4, 0)));
    assert.ok(new Range(0, 0, 0, 1).contains(new Range(0, 0, 0, 0)));
    assert.ok(new Range(0, 0, 1, 0).contains(new Range(0, 0, 0, 0)));
    assert.ok(new Range(0, 0, 0, 1).contains(new Range(0, 1, 0, 1)));
    assert.ok(new Range(0, 0, 1, 0).contains(new Range(1, 0, 1, 0)));
    assert.ok(!new Range(0, 0, 0, 0).contains(new Range(0, 0, 0, 1)));
    assert.ok(!new Range(0, 0, 0, 0).contains(new Range(0, 0, 1, 0)));
    assert.ok(!new Range(0, 0, 0, 1).contains(new Range(0, 1, 0, 2)));
    assert.ok(!new Range(0, 1, 0, 2).contains(new Range(0, 0, 0, 1)));
    assert.ok(new Range(0, 0, 0, 7).contains(new Position(0, 2)));
    assert.ok(new Range(0, 0, 0, 1).contains(new Position(0, 1)));
    assert.ok(!new Range(0, 0, 0, 1).contains(new Position(0, 2)));
  });

  test("intersection", () => {
    assert.ok(
      new Range(1, 2, 3, 4)
        .intersection(new Range(1, 7, 5, 2))
        ?.isRangeEqual(new Range(1, 7, 3, 4)),
    );
    assert.ok(
      new Range(1, 2, 1, 6).intersection(new Range(1, 6, 5, 2))?.isEmpty,
    );
    assert.equal(
      new Range(1, 2, 1, 5).intersection(new Range(1, 6, 1, 9)),
      undefined,
    );
  });

  test("with", () => {
    assert.ok(
      new Range(1, 2, 3, 4)
        .with(new Position(4, 5), undefined)
        .isRangeEqual(new Range(4, 5, 3, 4)),
    );
    assert.ok(
      new Range(1, 2, 3, 4)
        .with(undefined, new Position(4, 5))
        .isRangeEqual(new Range(1, 2, 4, 5)),
    );
  });

  test("union", () => {
    assert.ok(
      new Range(1, 2, 3, 4)
        .union(new Range(4, 2, 6, 1))
        .isRangeEqual(new Range(1, 2, 6, 1)),
    );
    assert.ok(
      new Range(1, 2, 3, 4)
        .union(new Range(0, 1, 0, 1))
        .isRangeEqual(new Range(0, 1, 3, 4)),
    );
    assert.ok(
      new Range(1, 2, 3, 4)
        .union(new Range(1, 3, 2, 4))
        .isRangeEqual(new Range(1, 2, 3, 4)),
    );
  });

  test("toSelection", () => {
    assert.ok(new Range(1, 2, 3, 4).toSelection(true).isReversed);
    assert.ok(!new Range(1, 2, 3, 4).toSelection(false).isReversed);
  });
});
