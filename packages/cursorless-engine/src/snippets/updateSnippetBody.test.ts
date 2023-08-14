import * as assert from "assert";
import { updateSnippetBody } from "./updateSnippetBody";

function testUpdate(title: string, body: string, expected: string) {
  test(title, () => {
    const actual = updateSnippetBody(body);
    assert.equal(actual, expected);
  });
}

suite("updateSnippetBody", () => {
  testUpdate("if", "if($1) {\n    $0\n}", "if($1) {\n\t$0\n}");
  testUpdate("increasing", "foo\n    bar\n        baz", "foo\n\tbar\n\t\tbaz");
  testUpdate("decreasing", "        foo\n    bar\nbaz", "\t\tfoo\n\tbar\nbaz");
  testUpdate("pyramid", "foo\n    bar\nbaz", "foo\n\tbar\nbaz");
  testUpdate("uneven", "  foo\n   bar\n    baz", "\tfoo\n\t bar\n\t\tbaz");
});
