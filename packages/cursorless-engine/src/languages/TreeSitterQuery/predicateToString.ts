import type { PredicateOperand, PredicateResult } from "web-tree-sitter";

export function predicateToString(
  predicateDescriptor: PredicateResult,
): string {
  const operandList = predicateDescriptor.operands
    .map(operandToString)
    .join(" ");

  return `(#${predicateDescriptor.operator} ${operandList})`;
}

export function operandToString(value: PredicateOperand): string {
  return value.type === "capture" ? `@${value.name}` : value.value;
}
