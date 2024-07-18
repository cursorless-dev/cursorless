import { range } from "lodash-es";
import * as assert from "node:assert";
import { createTestDocument } from "./createTestDocument";

interface TestCaseFixture {
  input: string;
  expectedRanges: string;
}

const textDocumentRangeFixtures: TestCaseFixture[] = [
  { input: "", expectedRanges: "0:0-0:0" },
  { input: "aaa", expectedRanges: "0:0-0:3" },
  { input: "\naaa", expectedRanges: "0:0-0:0, 1:0-1:3" },
  { input: "aaa\n", expectedRanges: "0:0-0:3, 1:0-1:0" },
  { input: "\naaa\n", expectedRanges: "0:0-0:0, 1:0-1:3, 2:0-2:0" },
  { input: "\n", expectedRanges: "0:0-0:0, 1:0-1:0" },
  { input: "\n\n", expectedRanges: "0:0-0:0, 1:0-1:0, 2:0-2:0" },
  { input: "aaa\n\naaa", expectedRanges: "0:0-0:3, 1:0-1:0, 2:0-2:3" },
  {
    input: "aaa\nbbb\r\nccc",
    expectedRanges: "0:0-0:3, 1:0-1:3, 2:0-2:3",
  },
];

suite("InMemoryTextDocument.lineAt", () => {
  for (const fixture of textDocumentRangeFixtures) {
    test(JSON.stringify(fixture.input), () => {
      const document = createTestDocument(fixture.input);
      const documentLineRanges = range(document.lineCount)
        .map((i) => document.lineAt(i).range.toString())
        .join(", ");
      assert.deepEqual(documentLineRanges, fixture.expectedRanges);
    });
  }

  test("basic", () => {
    const document = createTestDocument("hello  \n  world\n  ");

    assert.equal(document.lineCount, 3);

    const line0 = document.lineAt(0);
    const line1 = document.lineAt(1);
    const line2 = document.lineAt(2);
    const lineUnderflow = document.lineAt(-1);
    const lineOverflow = document.lineAt(100);

    assert.equal(line0.lineNumber, 0);
    assert.equal(line0.text, "hello  ");
    assert.equal(line0.isEmptyOrWhitespace, false);
    assert.equal(line0.firstNonWhitespaceCharacterIndex, 0);
    assert.equal(line0.lastNonWhitespaceCharacterIndex, 5);
    assert.equal(line0.range.toString(), "0:0-0:7");
    assert.equal(line0.rangeIncludingLineBreak.toString(), "0:0-1:0");

    assert.equal(line1.lineNumber, 1);
    assert.equal(line1.text, "  world");
    assert.equal(line1.isEmptyOrWhitespace, false);
    assert.equal(line1.firstNonWhitespaceCharacterIndex, 2);
    assert.equal(line1.lastNonWhitespaceCharacterIndex, 7);
    assert.equal(line1.range.toString(), "1:0-1:7");
    assert.equal(line1.rangeIncludingLineBreak.toString(), "1:0-2:0");

    assert.equal(line2.lineNumber, 2);
    assert.equal(line2.text, "  ");
    assert.equal(line2.isEmptyOrWhitespace, true);
    assert.equal(line2.firstNonWhitespaceCharacterIndex, 2);
    assert.equal(line2.lastNonWhitespaceCharacterIndex, 0);
    assert.equal(line2.range.toString(), "2:0-2:2");
    assert.equal(line2.rangeIncludingLineBreak.toString(), "2:0-2:2");

    assert.equal(lineUnderflow.lineNumber, 0);
    assert.equal(lineOverflow.lineNumber, 2);
  });
});
