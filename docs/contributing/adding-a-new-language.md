# Adding a new programming language

So you want cursorless to support a new language? Great! Here's how to do it:

## 1. Add support to the [vscode-parse-tree](https://github.com/pokey/vscode-parse-tree) extension

Cursorless relies on the vscode-parse-tree extension to access the parse tree
of a document. See the
[docs](https://github.com/pokey/vscode-parse-tree/#adding-a-new-language) there
for how to add support for a new parser

## 2. Define parse tree patterns in Cursorless

The parse trees exposed by tree-sitter are often pretty close to what we're
looking for, but we often need to look for specific patterns within the parse
tree to get the scopes that the user expects. Fortunately, we have a
domain-specific language that makes these definitions fairly compact.

- Check out the [docs](parse-tree-patterns.md) for the syntax tree pattern
  matcher
- You may also find it helpful to look at an existing language, such as
  [java](../../src/languages/java.ts).
- If you look in the debug console, you'll see debug output every time you move
  your cursor, which might be helpful.
- You will likely want to look at `node-types.json` for your language, (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/src/node-types.json)). This file is generated from `grammar.js`, which might also be helpful to look at (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/grammar.js)).

## 3. Write tests

Test cases can be automatically recorded, which should speed things up a lot.
See the [docs](test-case-recorder.md) for the test case recorder. It will also
likely be helpful to look at the existing recorded test cases (eg
[java](../../src/test/suite/fixtures/recorded/languages/java)) to see how
they
should end up looking when they're recorded.
