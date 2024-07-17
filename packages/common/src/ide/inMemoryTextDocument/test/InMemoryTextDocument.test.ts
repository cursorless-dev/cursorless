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
