import { SyntaxNode } from "web-tree-sitter";
import z from "zod";
import { QueryPredicateOperator } from "./QueryPredicateOperator";
import { q } from "./operatorArgumentSchemaTypes";
import { HasSchema } from "./PredicateOperatorSchemaTypes";

/**
 * A predicate operator that returns true if the node is not of the given type.
 * For example, `(not-type? string)` will match any node that is not a string.
 * It is acceptable to pass in multiple types, e.g. `(not-type? string comment)`.
 */
class NotType extends QueryPredicateOperator<NotType> {
  name = "not-type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  accept(node: SyntaxNode, ...types: string[]) {
    return !types.includes(node.type);
  }
}

/**
 * A predicate operator that returns true if the node's parent is not of the
 * given type. For example, `(not-parent-type? string)` will match any node that
 * is not a child of a string. It is acceptable to pass in multiple types, e.g.
 * `(not-parent-type? string comment)`.
 */
class NotParentType extends QueryPredicateOperator<NotParentType> {
  name = "not-parent-type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  accept(node: SyntaxNode, ...types: string[]) {
    return node.parent == null || !types.includes(node.parent.type);
  }
}

/**
 * A predicate operator that returns true if the node is the nth child of its
 * parent.  For example, `(is-nth-child? 0)` will match the first child of any
 * node.
 */
class IsNthChild extends QueryPredicateOperator<IsNthChild> {
  name = "is-nth-child?" as const;
  schema = z.tuple([q.node, q.integer]);
  accept(node: SyntaxNode, n: number) {
    return node.parent?.children.indexOf(node) === n;
  }
}

export const queryPredicateOperators: QueryPredicateOperator<HasSchema>[] = [
  new NotType(),
  new NotParentType(),
  new IsNthChild(),
];
