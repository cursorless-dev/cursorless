// From https://github.com/nodeca/js-yaml/issues/586#issuecomment-814310104
// This file ensures that simple objects and arrays (ie without array or object
// children) will be serialized inline, and also ensures that "fullTargets" will be inlined as well

import { dump, visit } from "js-yaml";
import type { Document, MappingNode, Node, SequenceNode } from "js-yaml";

function hasOnlyScalarChildren(node: MappingNode | SequenceNode): boolean {
  return node.kind === "mapping"
    ? node.items.every(({ value }) => value.kind === "scalar")
    : node.items.every((item) => item.kind === "scalar");
}

function inlineSimpleCollections(documents: Document[]): void {
  visit(documents, (node: Node, { depth }) => {
    if (depth > 0 && isCollectionNode(node) && hasOnlyScalarChildren(node)) {
      node.style.flow = true;
    }
  });
}

function isCollectionNode(node: Node): node is MappingNode | SequenceNode {
  return node.kind === "mapping" || node.kind === "sequence";
}

export function serialize(obj: unknown): string {
  const serialized = dump(obj, {
    noRefs: true,
    quoteStyle: "double",
    transform: inlineSimpleCollections,
  }).trim();
  return `${serialized}\n`;
}
