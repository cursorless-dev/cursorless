# Adding a new programming language

So you want cursorless to support a new language? Great! Here's how to do it:

## 1. Add support to [vscode-parse-tree](https://github.com/pokey/vscode-parse-tree)

See [docs](https://github.com/pokey/vscode-parse-tree/#adding-a-new-language).

## 2. Define parse tree patterns in Cursorless

- Check out the [docs](parse-tree-patterns.md) for the syntax tree pattern
  matcher
- You may also find it helpful to look at an existing language, such as
  [Java](https://github.com/pokey/cursorless-vscode/blob/master/src/languages/java.ts).
- If you look in the debug console, you'll see debug output every time you move
  your cursor, which might be helpful.
- You will likely want to look at `node-types.json` for your language, (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/src/node-types.json)). This file is generated from `grammar.js`, which might also be helpful to look at (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/grammar.js)).

## 3. Write tests

Test cases can be automatically recorded, which should speed things up a lot.
See the [docs](test-case-recorder.md) for the test case recorder. It will also
likely be helpful to look at the existing recorded test cases (eg
[java](../src/test/suite/fixtures/recorded/languages/java)) to see how
they
should end up looking when they're recorded.
