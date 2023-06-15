# Adding a new programming language

So you want cursorless to support a new language? Great! Here's how to do it:

## 1. Add support to the [vscode-parse-tree](https://github.com/pokey/vscode-parse-tree) extension

Cursorless relies on the vscode-parse-tree extension to access the parse tree
of a document. See the
[docs](https://github.com/pokey/vscode-parse-tree/#adding-a-new-language) there
for how to add support for a new parser

## 2. Define parse tree patterns in Cursorless

First a few notes / tips:

- We suggest opening a draft PR as soon as possible to get early feedback. Please use the new language PR template either by adding `?template=new_programming_language` to the end of the URL you used to open the PR, or just by copying and pasting from the [template](https://github.com/cursorless-dev/cursorless/blob/main/.github/PULL_REQUEST_TEMPLATE/new_programming_language.md?plain=1) to your PR body, if that's easier.
- We suggest adding tests as early as possible, after each language feature you add. Recording tests is quick and painless using the test case recorder described below. We promise 😇

To add a new language, you just need to add a `.scm` file to the [`queries` directory](../../queries). The `.scm` query format is documented [here](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax).

The parse trees exposed by tree-sitter are often pretty close to what we're
looking for, but we often need to look for specific patterns within the parse
tree to get the scopes that the user expects. Fortunately, the tree-sitter query language makes these definitions fairly compact.

- Check out the [docs](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax) for the query language.
- Have a look at our custom query predicate operators in [`queryPredicateOperators.ts`](../../packages/cursorless-engine/src/languages/TreeSitterQuery/queryPredicateOperators.ts)
- Look at the existing language definitions in the [`queries` directory](../../queries) for examples.
- If you look in the debug console, you'll see debug output every time you move
  your cursor, which might be helpful.
- You will likely want to look at `node-types.json` for your language, (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/src/node-types.json)). This file is generated from `grammar.js`, which might also be helpful to look at (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/grammar.js)).

### Writing tests

Test cases can be automatically recorded, which should speed things up a lot.
See the [docs](test-case-recorder.md) for the test case recorder. It will also
likely be helpful to look at the existing recorded test cases (eg
[java](../../packages/cursorless-vscode-e2e/src/suite/fixtures/recorded/languages/java)) to see how
they
should end up looking when they're recorded.
