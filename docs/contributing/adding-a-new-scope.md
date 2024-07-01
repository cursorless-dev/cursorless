# Adding a new scope

For each scope that your language should support (eg `"funk"`), you need to do the following:

## 1. Find the scope's internal identifier

You'll first need to figure out the internal identifier we use for the given scope. You can do so by looking in your `modifier_scope_types.csv` (see [Customization](../user/customization.md) if you're not sure where that file is). The internal identifier is the second column in the CSV file. For example, the internal identifier for `"funk"` is `namedFunction`. This identifier is what you'll use in the `.scm` file in step 4 below when you define your language's parse tree patterns.

## 2. Find the appropriate scope support facets

Find the _facets_ of the given scope that are relevant to your language. Each scope has several "facets" that indicate different syntactic constructs that should be considered to be the given scope.

For example, `"funk"` (`namedFunction`) has the following facets:

- `namedFunction`, corresponding to a standalone function declaration,
- `namedfunction.method`, corresponding to a class method declaration, and
- `namedfunction.constructor`, corresponding to a class constructor declaration.

Have a look in [`scopeSupportFacetInfos`](../../packages/common/src/scopeSupportFacets/scopeSupportFacetInfos.ts) to see which facets the given scope has. The key is the id of the facet, and the value has information about the facet, including a description and a `scopeType` field indicating which scope type the facet corresponds to.

These facet ids will be the keys in your language's scope support table below.

Note that in addition to the straightforward facet IDs that correspond to the scope type, there are also some special facet IDs. In particular:

- `foo.iteration` indicates the iteration scope of a given facet. For example, `namedFunction.method.iteration.class` allows you to indicate that the iteration scope for functions is a class.
- `textFragment.xxx` scopes allow you to indicate regions in the document that have no syntactic structure. These allow us to support matching pairs inside of strings and comments, where there will be no tokens for delimiters like `(` and `)`.

## 3. Add entries to your language's scope support table

Add entries for each of the facet IDs of the given scope to the scope support table for your language in [the `scopeSupportFacets` directory](/../../packages/common/src/scopeSupportFacets).

For example, if you'd like to add support for the `namedFunction` facet of the `funk` scope, you would add entries like the following to your language's scope support table:

```ts
  namedFunction: supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,
  "namedFunction.constructor": supported,
  "namedFunction.iteration": supported,
  "namedFunction.iteration.document": supported,
```

If one of the above facets doesn't apply to your language, you can mark it as `notApplicable` instead of `supported`. If the facet does apply to your language, but you'd prefer to add support in a follow-up PR, you can mark it as `unsupported`.

## 4. Add tests for the given scope

We have a bulk test recorder for scope tests. You can use it by running Cursorless in debug mode, and then saying `"cursorless record scope"`, and selecting your language. This will create a temporary file containing slots for every scope facet in your language which you've marked `supported` but that doesn't yet have any tests. You can then fill in the tests for each facet by providing a small snippet of code exemplifying the given facet.

When you're done, say `"cursorless save scope"` to save the tests to the appropriate files in the `data/fixtures/recorded/scopes` directory.

## 5. Add parse tree patterns for the given scope

Launch your extension in debug mode and open a file in your language. You can create one or more files in [`playground/`](../../data/playground) and feel free to include those in your PR.

Then add parse tree patterns for the given scope to your language's `.scm` file in the [`queries` directory](../../queries). The parse tree patterns should match the syntactic constructs that should be considered to be the given scope. Tag the nodes in the parse tree that correspond to the given scope with the internal identifier you found in step 1 above, eg `@namedFunction`. Note that you use the scope identifier (`namedFunction`), not the facet identifier (`@namedFunction.class`).

### Notes / tips

- See our [Tree-sitter query syntax](tree-sitter-query-syntax.md) guide for more information on the syntax we support.
- Look at the existing language definitions in the [`queries` directory](../../queries) for examples.
- Use the [scope visualizer](../user/scope-visualizer.md) to see your scope highlighted in real time every time you save the `.scm` file.
- Use the command `"parse tree <target>"` to see the parse tree for a given target. For example `"parse tree line"` will show you the parse tree for the current line, as well as all of its ancestors. This will generate a markdown file with parse tree info, which you can then use to write your patterns. You might find it helpful to open a markdown preview of the file.
- You will likely want to look at `node-types.json` for your language, (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/src/node-types.json)). This file is generated from the language's `grammar.js`, which might also be helpful to look at (eg [java](https://github.com/tree-sitter/tree-sitter-java/blob/master/grammar.js)).

## Examples

Here are a few example PRs adding scopes. Note that in each case the PR also introduced a new facet, but in many cases you will just be able to use an existing facet.

- [#2346](https://github.com/cursorless-dev/cursorless/pull/2346)
- [#2215](https://github.com/cursorless-dev/cursorless/pull/2215)
- [#2361](https://github.com/cursorless-dev/cursorless/pull/2361)
- [#2364](https://github.com/cursorless-dev/cursorless/pull/2364)
