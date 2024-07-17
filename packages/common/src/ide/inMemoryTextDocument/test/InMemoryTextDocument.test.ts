import * as assert from "node:assert";
import { URI } from "vscode-uri";
import { Position } from "../../../types/Position";
import { Range } from "../../../types/Range";
import { InMemoryTextDocument } from "../InMemoryTextDocument";
import { createTestDocument } from "./createTestDocument";

suite("InMemoryTextDocument", () => {
  test("constructor", () => {
    const document = createTestDocument("hello\nworld");

    assert.equal(document.uri.toString(), "cursorless-dummy://dummy/untitled");
    assert.equal(document.languageId, "plaintext");
    assert.equal(document.filename, "untitled");
    assert.equal(document.text, "hello\nworld");
    assert.equal(document.lineCount, 2);
    assert.equal(document.eol, "LF");
    assert.equal(document.version, 0);
  });

  test("filename", () => {
    const document1 = new InMemoryTextDocument(
      URI.parse("cursorless-dummy://dummy/foo.ts"),
      "",
      "",
    );
    const document2 = new InMemoryTextDocument(
      URI.file("dummy\\bar.ts"),
      "",
      "",
    );

    assert.equal(document1.filename, "foo.ts");
    assert.equal(document2.filename, "bar.ts");
  });

  test("CRLF", () => {
    const document = createTestDocument("foo\nbar\r\nbaz");

    assert.equal(document.lineCount, 3);
    assert.equal(document.eol, "CRLF");
  });

  test("getText", () => {
    const document = createTestDocument("foo\nbar\r\nbaz");

    assert.equal(document.getText(), document.text);
    assert.equal(document.getText(document.range), document.text);
    assert.equal(document.getText(new Range(0, 0, 5, 0)), document.text);
    assert.equal(document.getText(new Range(0, 0, 0, 0)), "");
    assert.equal(document.getText(new Range(0, 0, 0, 3)), "foo");
    assert.equal(document.getText(new Range(1, 0, 2, 0)), "bar\r\n");
    assert.equal(document.getText(new Range(0, 3, 1, 0)), "\n");
    assert.equal(document.getText(new Range(1, 3, 2, 0)), "\r\n");
  });

  test("lineAt", () => {
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

  test("offsetAt", () => {
    const document = createTestDocument("hello  \n  world\r\n");

    assert.equal(document.offsetAt(new Position(-1, 0)), 0);
    assert.equal(document.offsetAt(new Position(0, -1)), 0);
    assert.equal(document.offsetAt(new Position(0, 0)), 0);
    assert.equal(document.offsetAt(new Position(0, 7)), 7);
    assert.equal(document.offsetAt(new Position(0, 100)), 7);
    assert.equal(document.offsetAt(new Position(1, 0)), 8);
    assert.equal(document.offsetAt(new Position(1, 2)), 10);
    assert.equal(document.offsetAt(new Position(2, 0)), 17);
    assert.equal(document.offsetAt(new Position(2, 0)), document.text.length);
    assert.equal(document.offsetAt(new Position(100, 0)), document.text.length);
  });

  test("positionAt", () => {
    const document = createTestDocument("hello  \n  world\r\n");

    assert.equal(document.positionAt(-1), "0:0");
    assert.equal(document.positionAt(0).toString(), "0:0");
    assert.equal(document.positionAt(7).toString(), "0:7");
    assert.equal(document.positionAt(8).toString(), "1:0");
    assert.equal(document.positionAt(10).toString(), "1:2");
    assert.equal(document.positionAt(17).toString(), "2:0");
    assert.equal(document.positionAt(document.text.length).toString(), "2:0");
    assert.equal(document.positionAt(100).toString(), "2:0");
  });
});
