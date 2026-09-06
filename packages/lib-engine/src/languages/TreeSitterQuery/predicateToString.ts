import type { PredicateStep, QueryPredicate } from "web-tree-sitter";

export function predicateToString(predicateDescriptor: QueryPredicate): string {
  const operandList = predicateDescriptor.operands
    .map(operandToString)
    .join(" ");

  return `(#${predicateDescriptor.operator} ${operandList})`;
}

export function operandToString(value: PredicateStep): string {
  return value.type === "capture" ? `@${value.name}` : value.value;
}
