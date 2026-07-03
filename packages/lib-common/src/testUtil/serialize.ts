// From https://github.com/nodeca/js-yaml/issues/586#issuecomment-814310104
// This file ensures that simple objects and arrays (ie without array or object
// children) will be serialized inline, and also ensures that "fullTargets" will be inlined as well

import { CORE_SCHEMA, dump, visit, YAML11_SCHEMA } from "js-yaml";
import type { Document, MappingNode, Node, SequenceNode } from "js-yaml";

export function serialize(obj: unknown): string {
  return dump(toSerializableObject(obj), {
    noRefs: true,
    quoteStyle: "double",
    schema: CORE_SCHEMA,
    transform: inlineSimpleCollections,
  });
}

function toSerializableObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toSerializableObject);
  }

  if (value == null || typeof value !== "object" || value instanceof Date) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      toSerializableObject(value),
    ]),
  );
}

function inlineSimpleCollections(documents: Document[]): void {
  visit(documents, (node: Node, { depth, isKey, parent }) => {
    if (depth > 0 && isCollectionNode(node) && hasOnlyScalarChildren(node)) {
      node.style.flow = true;
    }

    if (
      node.kind === "scalar" &&
      node.tag === "tag:yaml.org,2002:str" &&
      !isKey &&
      parent?.style.flow === true &&
      !node.value.includes("\n") &&
      !node.value.includes("\r") &&
      scalarNeedsQuotesInFlow(node.value)
    ) {
      node.style.singleQuoted = true;
    }
  });
}

function isCollectionNode(node: Node): node is MappingNode | SequenceNode {
  return node.kind === "mapping" || node.kind === "sequence";
}

function hasOnlyScalarChildren(node: MappingNode | SequenceNode): boolean {
  return node.kind === "mapping"
    ? node.items.every(({ value }) => value.kind === "scalar")
    : node.items.every((item) => item.kind === "scalar");
}

function scalarNeedsQuotesInFlow(value: string): boolean {
  return dump([value], {
    flowLevel: 0,
    quoteStyle: "double",
    schema: YAML11_SCHEMA,
  })
    .trim()
    .startsWith('["');
}
