import assert from "node:assert/strict";
import { getPairedDelimiterCommandName } from "./getPairedDelimiterCommandName";

suite("getPairedDelimiterCommandName", () => {
  test("wrap maps to wrapWithPairedDelimiter", () => {
    assert.equal(
      getPairedDelimiterCommandName("wrap"),
      "wrapWithPairedDelimiter",
    );
  });

  test("rewrap maps to rewrapWithPairedDelimiter", () => {
    assert.equal(
      getPairedDelimiterCommandName("rewrap"),
      "rewrapWithPairedDelimiter",
    );
  });
});
