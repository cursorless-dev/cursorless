import { Range, adjustPosition } from "@cursorless/common";
import z from "zod";
import { makeRangeFromPositions } from "../../util/nodeSelectors";
import { MutableQueryCapture } from "./QueryCapture";
import { QueryPredicateOperator } from "./QueryPredicateOperator";
import { q } from "./operatorArgumentSchemaTypes";

/**
 * A predicate operator that returns true if the node is not of the given type.
 * For example, `(not-type? @foo string)` will reject the match if the `@foo`
 * capture is a `string` node. It is acceptable to pass in multiple types, e.g.
 * `(not-type? @foo string comment)`.
 */
class NotType extends QueryPredicateOperator<NotType> {
  name = "not-type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  run({ node }: MutableQueryCapture, ...types: string[]) {
    return !types.includes(node.type);
  }
}

/**
 * A predicate operator that returns true if the nodes range is not empty.
 */
class NotEmpty extends QueryPredicateOperator<NotEmpty> {
  name = "not-empty?" as const;
  schema = z.tuple([q.node]);
  run({ range }: MutableQueryCapture) {
    return !range.isEmpty;
  }
}

/**
 * A predicate operator that returns true if the node's parent is not of the
 * given type. For example, `(not-parent-type? @foo string)` will reject the
 * match if the `@foo` capture is a child of a `string` node. It is acceptable
 * to pass in multiple types, e.g. `(not-parent-type? @foo string comment)`.
 */
class NotParentType extends QueryPredicateOperator<NotParentType> {
  name = "not-parent-type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  run({ node }: MutableQueryCapture, ...types: string[]) {
    return node.parent == null || !types.includes(node.parent.type);
  }
}

/**
 * A predicate operator that returns true if the node is the nth child of its
 * parent.  For example, `(is-nth-child? @foo 0)` will reject the match if the
 * `@foo` capture is not the first child of its parent.
 */
class IsNthChild extends QueryPredicateOperator<IsNthChild> {
  name = "is-nth-child?" as const;
  schema = z.tuple([q.node, q.integer]);
  run({ node }: MutableQueryCapture, n: number) {
    return node.parent?.children.findIndex((n) => n.id === node.id) === n;
  }
}

/**
 * A predicate operator that returns true if the node has more than 1 child of
 * type {@link type} (inclusive).  For example, `(has-multiple-children-of-type?
 * @foo bar)` will accept the match if the `@foo` capture has 2 or more children
 * of type `bar`.
 */
class HasMultipleChildrenOfType extends QueryPredicateOperator<HasMultipleChildrenOfType> {
  name = "has-multiple-children-of-type?" as const;
  schema = z.tuple([q.node, q.string]);

  run({ node }: MutableQueryCapture, type: string) {
    const count = node.children.filter((n) => n.type === type).length;
    return count > 1;
  }
}

class ChildRange extends QueryPredicateOperator<ChildRange> {
  name = "child-range!" as const;
  schema = z.union([
    z.tuple([q.node, q.integer]),
    z.tuple([q.node, q.integer, q.integer]),
    z.tuple([q.node, q.integer, q.integer, q.boolean]),
    z.tuple([q.node, q.integer, q.integer, q.boolean, q.boolean]),
  ]);

  run(
    nodeInfo: MutableQueryCapture,
    startIndex: number,
    endIndex?: number,
    excludeStart?: boolean,
    excludeEnd?: boolean,
  ) {
    const {
      node: { children },
    } = nodeInfo;

    startIndex = startIndex < 0 ? children.length + startIndex : startIndex;
    endIndex = endIndex == null ? -1 : endIndex;
    endIndex = endIndex < 0 ? children.length + endIndex : endIndex;

    const start = children[startIndex];
    const end = children[endIndex];

    nodeInfo.range = makeRangeFromPositions(
      excludeStart ? start.endPosition : start.startPosition,
      excludeEnd ? end.startPosition : end.endPosition,
    );

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match to shrink to regex
 * match.  For example, `(#shrink-to-match! @foo "\\S+")` will modify the range
 * of the `@foo` capture to exclude whitespace.
 *
 * If convenient, you can use a special capture group called `keep` to indicate
 * the part of the match that should be kept.  For example,
 *
 * ```
 * (#shrink-to-match! @foo "^\s+(?<keep>.*)$")
 * ```
 *
 * will modify the range of the `@foo` capture to skip any leading whitespace.
 */
class ShrinkToMatch extends QueryPredicateOperator<ShrinkToMatch> {
  name = "shrink-to-match!" as const;
  schema = z.tuple([q.node, q.string]);

  run(nodeInfo: MutableQueryCapture, pattern: string) {
    const { document, range } = nodeInfo;
    const text = document.getText(range);
    const match = text.match(new RegExp(pattern, "ds"));

    if (match?.index == null) {
      throw Error(`No match for pattern '${pattern}'`);
    }

    const [startOffset, endOffset] =
      match.indices?.groups?.keep ?? match.indices![0];

    const baseOffset = document.offsetAt(range.start);

    nodeInfo.range = new Range(
      document.positionAt(baseOffset + startOffset),
      document.positionAt(baseOffset + endOffset),
    );

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match by trimming trailing whitespace,
 * similar to the javascript trimEnd function.
 */
class TrimEnd extends QueryPredicateOperator<TrimEnd> {
  name = "trim-end!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    const { document, range } = nodeInfo;
    const text = document.getText(range);
    const whitespaceLength = text.length - text.trimEnd().length;
    nodeInfo.range = new Range(
      range.start,
      adjustPosition(document, range.end, -whitespaceLength),
    );
    return true;
  }
}

class AllowMultiple extends QueryPredicateOperator<AllowMultiple> {
  name = "allow-multiple!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    nodeInfo.allowMultiple = true;

    return true;
  }
}

/**
 * A predicate operator that logs a node, for debugging.
 */
class Log extends QueryPredicateOperator<Log> {
  name = "log!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    console.log(`#log!: ${nodeInfo.name}@${nodeInfo.range}`);
    return true;
  }
}

/**
 * A predicate operator that sets the insertion delimiter of the match. For
 * example, `(#insertion-delimiter! @foo ", ")` will set the insertion delimiter
 * of the `@foo` capture to `", "`.
 */
class InsertionDelimiter extends QueryPredicateOperator<InsertionDelimiter> {
  name = "insertion-delimiter!" as const;
  schema = z.tuple([q.node, q.string]);

  run(nodeInfo: MutableQueryCapture, insertionDelimiter: string) {
    nodeInfo.insertionDelimiter = insertionDelimiter;

    return true;
  }
}

export const queryPredicateOperators = [
  new Log(),
  new NotType(),
  new TrimEnd(),
  new NotEmpty(),
  new NotParentType(),
  new IsNthChild(),
  new ChildRange(),
  new ShrinkToMatch(),
  new AllowMultiple(),
  new InsertionDelimiter(),
  new HasMultipleChildrenOfType(),
];
