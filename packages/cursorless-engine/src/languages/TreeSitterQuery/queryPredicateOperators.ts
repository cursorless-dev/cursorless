import { Range } from "@cursorless/common";
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
 * A predicate operator that modifies the range of the match to be a zero-width
 * range at the start of the node.  For example, `(#start-position! @foo)` will
 * modify the range of the `@foo` capture to be a zero-width range at the start
 * of the `@foo` node.
 */
class StartPosition extends QueryPredicateOperator<StartPosition> {
  name = "start-position!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    nodeInfo.range = new Range(nodeInfo.range.start, nodeInfo.range.start);

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match to be a zero-width
 * range at the end of the node.  For example, `(#end-position! @foo)` will
 * modify the range of the `@foo` capture to be a zero-width range at the end of
 * the `@foo` node.
 */
class EndPosition extends QueryPredicateOperator<EndPosition> {
  name = "end-position!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    nodeInfo.range = new Range(nodeInfo.range.end, nodeInfo.range.end);

    return true;
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

class Pattern extends QueryPredicateOperator<Pattern> {
  name = "pattern!" as const;
  schema = z.tuple([q.node, q.string]);

  run(nodeInfo: MutableQueryCapture, pattern: string) {
    const {
      range,
      node: { text },
    } = nodeInfo;

    if (!range.isSingleLine) {
      return false;
    }

    const match = text.match(new RegExp(pattern));

    if (match?.index == null) {
      return false;
    }

    nodeInfo.range = new Range(
      range.start.translate(undefined, match.index),
      range.start.translate(undefined, match.index + match[0].length),
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
  new NotParentType(),
  new IsNthChild(),
  new StartPosition(),
  new EndPosition(),
  new ChildRange(),
  new Pattern(),
  new AllowMultiple(),
];
