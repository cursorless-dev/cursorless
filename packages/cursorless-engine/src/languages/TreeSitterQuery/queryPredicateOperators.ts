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
 */
class ShrinkToMatch extends QueryPredicateOperator<ShrinkToMatch> {
  name = "shrink-to-match!" as const;
  schema = z.tuple([q.node, q.string]);

  run(nodeInfo: MutableQueryCapture, pattern: string) {
    const { document, range } = nodeInfo;
    const text = document.getText(range);
    const match = text.match(new RegExp(pattern));

    if (match?.index == null) {
      throw Error(`No match for pattern '${pattern}'`);
    }

    const startIndex = document.offsetAt(range.start) + match.index;
    const endIndex = startIndex + match[0].length;

    nodeInfo.range = new Range(
      document.positionAt(startIndex),
      document.positionAt(endIndex),
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

export const queryPredicateOperators = [
  new NotType(),
  new NotEmpty(),
  new NotParentType(),
  new IsNthChild(),
  new ChildRange(),
  new ShrinkToMatch(),
  new AllowMultiple(),
];
