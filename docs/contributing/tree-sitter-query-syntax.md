# Tree-sitter query syntax

We use the tree-sitter query language to define our parse tree patterns. In addition to the [official tree-sitter query documentation](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax), we support a couple of additional features.

## Relationships

In addition to the node corresponding to the scope itself (which we call its _content range_), you can tag different aspects of the scope. Assuming the internal identifier of our scope is `foo`, we can tag the following aspects of the scope:

- `@foo.domain` indicates the domain of the scope. For example, you could use `@collectionKey.domain` to indicate that the domain of a key is the containing item, which would allow you to say `"take key"` from within the value of a key-value pair to select the key.
- `@foo.leading` and `@foo.trailing` indicate the leading and trailing delimiters of the scope. For example, you could use `@collectionKey.trailing` to include all the way up to the start of the value as the trailing delimiter, so that `"chuck key"` will leave just the value.
- `@foo.removal` to indicate the removal range of the scope. Note that it is preferred to use `@foo.leading` or `@foo.trailing` instead of `@foo.removal` in situations where you just need to include a leading or trailing delimiter in the removal range.
- `@foo.interior` to indicate the interior of the scope, used for `"inside"`. For example, you could use `@namedFunction.interior` to indicate the interior of a function, which would usually be the function body itself, without any leading or trailing delimiters.
- `@foo.iteration` to indicate the iteration scope of the scope. For example, you could use `@namedFunction.iteration` to indicate that the iteration scope for functions is a class. Note that unlike the other aspects, the iteration scope is not a part of the scope itself, but rather a separate scope that is used to determine the iteration scope of the given scope. Thus, it should nearly always appear in a separate pattern from the scope itself, unlike the other aspects, which must appear in the same pattern as the scope itself.

## Inline operators

In addition to the above aspects, you can also use the following inline operators to modify the scope:

- `@foo.start` and `@foo.end` to construct the scope using a range between two nodes (inclusive).
- `@foo.startOf` and `@foo.endOf` to refer to the start and end positions of a node. For example, you could use `@foo.start.endOf` to indicate that the scope should start at the end of the node.

## Query predicate operators

We also support a number of query predicate operators for modifying the scope. See [`queryPredicateOperators.ts`](../../packages/cursorless-engine/src/languages/TreeSitterQuery/queryPredicateOperators.ts) for a list of available operators.
