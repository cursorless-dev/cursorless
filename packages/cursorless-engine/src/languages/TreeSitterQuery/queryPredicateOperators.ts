import { Range } from "@cursorless/common";
import z from "zod";
import { HasSchema } from "./PredicateOperatorSchemaTypes";
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
    return node.parent?.children.indexOf(node) === n;
  }
}

/**
 * A predicate operator that modifies the range of the match to be a zero-width
 * range at the start of the node.  For example, `(#start! @foo)` will modify
 * the range of the `@foo` capture to be a zero-width range at the start of the
 * `@foo` node.
 */
class Start extends QueryPredicateOperator<Start> {
  name = "start!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    nodeInfo.range = new Range(nodeInfo.range.start, nodeInfo.range.start);

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match to be a zero-width
 * range at the end of the node.  For example, `(#end! @foo)` will modify
 * the range of the `@foo` capture to be a zero-width range at the end of the
 * `@foo` node.
 */
class End extends QueryPredicateOperator<End> {
  name = "end!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    nodeInfo.range = new Range(nodeInfo.range.end, nodeInfo.range.end);

    return true;
  }
}

export const queryPredicateOperators: QueryPredicateOperator<HasSchema>[] = [
  new NotType(),
  new NotParentType(),
  new IsNthChild(),
  new Start(),
  new End(),
];
