import * as assert from "assert";
import { Position, Selection } from "..";

suite("Selection", () => {
  test("constructor", () => {
    assert.equal(new Selection(5, 0, 10, 0).anchor.line, 5);
    assert.equal(new Selection(0, 5, 0, 10).anchor.character, 5);
    assert.equal(new Selection(0, 0, 5, 0).active.line, 5);
    assert.equal(new Selection(0, 0, 0, 5).active.character, 5);
    assert.equal(new Selection(5, 0, 0, 0).active.line, 0);
    assert.equal(new Selection(0, 5, 0, 0).active.character, 0);
    assert.equal(new Selection(5, 0, 0, 0).anchor.line, 5);
    assert.equal(new Selection(0, 5, 0, 0).anchor.character, 5);
    assert.ok(
      new Selection(new Position(1, 2), new Position(3, 4)).isEqual(
        new Selection(1, 2, 3, 4),
      ),
    );
  });

  test("isReversed", () => {
    assert.ok(!new Selection(0, 0, 0, 0).isReversed);
    assert.ok(new Selection(1, 0, 0, 0).isReversed);
    assert.ok(new Selection(0, 1, 0, 0).isReversed);
    assert.ok(!new Selection(0, 0, 1, 0).isReversed);
    assert.ok(!new Selection(0, 0, 0, 1).isReversed);
  });

  test("isEqual", () => {
    assert.ok(new Selection(0, 0, 0, 0).isEqual(new Selection(0, 0, 0, 0)));
    assert.ok(new Selection(1, 0, 0, 0).isEqual(new Selection(1, 0, 0, 0)));
    assert.ok(new Selection(0, 1, 0, 0).isEqual(new Selection(0, 1, 0, 0)));
    assert.ok(new Selection(0, 0, 1, 0).isEqual(new Selection(0, 0, 1, 0)));
    assert.ok(new Selection(0, 0, 0, 1).isEqual(new Selection(0, 0, 0, 1)));
    assert.ok(!new Selection(0, 0, 0, 0).isEqual(new Selection(1, 0, 0, 0)));
    assert.ok(!new Selection(0, 0, 0, 0).isEqual(new Selection(0, 1, 0, 0)));
    assert.ok(!new Selection(0, 0, 0, 0).isEqual(new Selection(0, 0, 1, 0)));
    assert.ok(!new Selection(0, 0, 0, 0).isEqual(new Selection(0, 0, 0, 1)));
    assert.ok(!new Selection(0, 0, 0, 1).isEqual(new Selection(0, 1, 0, 0)));
  });

  test("isRangeEqual", () => {
    assert.ok(
      new Selection(0, 0, 0, 1).isRangeEqual(new Selection(0, 1, 0, 0)),
    );
  });

  test("toSelection", () => {
    assert.ok(new Selection(1, 2, 3, 4).toSelection(true).isReversed);
    assert.ok(!new Selection(1, 2, 3, 4).toSelection(false).isReversed);
  });
});
