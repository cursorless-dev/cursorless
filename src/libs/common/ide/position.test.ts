import * as assert from "assert";
import { Position } from ".";

suite.only("Position", () => {
  test("isEqual", () => {
    assert.ok(new Position(0, 0).isEqual(new Position(0, 0)));
    assert.ok(new Position(1, 2).isEqual(new Position(1, 2)));
    assert.ok(new Position(3, 2).isEqual(new Position(3, 2)));
    assert.ok(!new Position(0, 0).isEqual(new Position(0, 1)));
    assert.ok(!new Position(0, 0).isEqual(new Position(1, 0)));
  });

  test("isBefore", () => {
    assert.ok(new Position(0, 0).isBefore(new Position(1, 0)));
    assert.ok(new Position(0, 0).isBefore(new Position(0, 1)));
    assert.ok(!new Position(1, 0).isBefore(new Position(0, 0)));
    assert.ok(!new Position(0, 1).isBefore(new Position(0, 0)));
  });

  test("isAfter", () => {
    assert.ok(new Position(1, 0).isAfter(new Position(0, 0)));
    assert.ok(new Position(0, 1).isAfter(new Position(0, 0)));
    assert.ok(!new Position(0, 0).isAfter(new Position(1, 0)));
    assert.ok(!new Position(0, 0).isAfter(new Position(0, 1)));
  });

  test("isBeforeOrEqual", () => {
    assert.ok(new Position(0, 0).isBeforeOrEqual(new Position(0, 0)));
    assert.ok(new Position(0, 0).isBeforeOrEqual(new Position(1, 0)));
    assert.ok(new Position(0, 0).isBeforeOrEqual(new Position(0, 1)));
  });

  test("isAfterOrEqual", () => {
    assert.ok(new Position(0, 0).isAfterOrEqual(new Position(0, 0)));
    assert.ok(new Position(1, 0).isAfterOrEqual(new Position(0, 0)));
    assert.ok(new Position(0, 1).isAfterOrEqual(new Position(0, 0)));
  });

  test("compareTo", () => {
    assert.equal(0, new Position(0, 0).compareTo(new Position(0, 0)));
    assert.equal(-1, new Position(0, 0).compareTo(new Position(1, 0)));
    assert.equal(-1, new Position(0, 0).compareTo(new Position(0, 1)));
    assert.equal(1, new Position(1, 0).compareTo(new Position(0, 0)));
    assert.equal(1, new Position(0, 1).compareTo(new Position(0, 0)));
  });

  test("with", () => {
    assert.ok(
      new Position(1, 1).with(5, undefined).isEqual(new Position(5, 1)),
    );
    assert.ok(
      new Position(1, 1).with(undefined, 5).isEqual(new Position(1, 5)),
    );
  });

  test("translate", () => {
    assert.ok(
      new Position(1, 1).translate(5, undefined).isEqual(new Position(6, 1)),
    );
    assert.ok(
      new Position(1, 1).translate(undefined, 5).isEqual(new Position(1, 6)),
    );
  });
});
