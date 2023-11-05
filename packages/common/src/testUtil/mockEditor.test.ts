import * as assert from "assert";
import { MockTextDocument, Range } from "..";
import * as fc from "fast-check";

suite("mockEditor", () => {
  test("basic", () => {
    const s = "abc\n\n123\n";
    const doc: MockTextDocument = new MockTextDocument(
      "test.txt",
      "plaintext",
      s,
    );

    for (let i = 0; i < s.length; i++) {
      const pos = doc.positionAt(i);
      const offset = doc.offsetAt(pos);
      assert.equal(offset, i);
    }
    const line0 = doc.lineAt(0);
    assert.equal(line0.text, "abc");
    assert.equal(line0.firstNonWhitespaceCharacterIndex, 0);
    assert.equal(line0.isEmptyOrWhitespace, false);
    assert.equal(line0.lineNumber, 0);
    assert.ok(line0.range.isEqual(new Range(0, 0, 0, 3)));
    assert.equal(line0.rangeIncludingLineBreak.start.character, 0);
    assert.equal(line0.lastNonWhitespaceCharacterIndex, 2);

    const line1 = doc.lineAt(1);
    assert.equal(line1.text, "");
    assert.equal(line1.firstNonWhitespaceCharacterIndex, 0);
    assert.equal(line1.isEmptyOrWhitespace, true);
    assert.equal(line1.lineNumber, 1);
    assert.ok(line1.range.isEqual(new Range(1, 0, 1, 0)));
    assert.equal(line1.rangeIncludingLineBreak.start.character, 0);
    assert.equal(line1.lastNonWhitespaceCharacterIndex, 0);
  });

  test("fastcheck", () => {
    fc.assert(
      fc.property(fc.string(), (contents) => {
        const doc: MockTextDocument = new MockTextDocument(
          "test.txt",
          "plaintext",
          contents,
        );
        let tot: number = 0;
        for (let lineno = 0; lineno < doc.lineCount; lineno++) {
          const line = doc.lineAt(lineno);
          tot += line.rangeIncludingLineBreak.end.character;
          assert.equal(line.lineNumber, lineno);
          assert.equal(line.range.start.line, lineno);
          assert.equal(line.range.end.line, lineno);
          assert.equal(line.rangeIncludingLineBreak.start.line, lineno);
          assert.equal(line.rangeIncludingLineBreak.end.line, lineno);
          assert.equal(
            line.rangeIncludingLineBreak.end.character,
            line.text.length,
          );
          assert.equal(
            line.rangeIncludingLineBreak.end.character,
            line.range.end.character,
          );
        }
        assert.equal(tot, contents.length);

        for (let i = 0; i < contents.length; i++) {
          const pos = doc.positionAt(i);
          // positions must be within the range of a line
          assert.ok(pos.character <= doc.lineAt(pos.line).range.end.character);
          const offset = doc.offsetAt(pos);
          // positionAt and offsetAt are inverses
          assert.equal(offset, i);
          return true;
        }
      }),
    );
  });
});
