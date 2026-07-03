// This file ensures that simple objects and arrays (ie without array or object
// children) will be serialized inline, and also ensures that "fullTargets" will be inlined as well

import type { Document, MappingNode, Node, SequenceNode } from "js-yaml";
import { CORE_SCHEMA, dump, visit, YAML11_SCHEMA } from "js-yaml";

export function serialize(obj: unknown): string {
  return dump(toSerializableObject(obj), {
    noRefs: true,
    quoteStyle: "double",
    // CORE_SCHEMA preserves existing fixture output for numeric-looking strings
    // like `1_01_001`, which js-yaml's default schema would quote.
    schema: CORE_SCHEMA,
    transform: inlineSimpleCollections,
  });
}

function toSerializableObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toSerializableObject);
  }

  if (value == null || typeof value !== "object") {
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
    // Keep nested simple objects and arrays in flow style, eg `{line: 0}` and
    // `[default.a]`, while leaving top-level mappings in block style.
    if (depth > 0 && isCollectionNode(node) && hasOnlyScalarChildren(node)) {
      node.style.flow = true;
    }

    // Existing fixtures use single quotes for flow scalar values that need
    // quoting, eg `{character: ']'}`. Do not apply this to keys, non-string
    // scalars, block scalars, or multiline strings.
    if (
      !isKey &&
      parent != null &&
      parent.style.flow &&
      node.kind === "scalar" &&
      node.tag === "tag:yaml.org,2002:str" &&
      !node.value.includes("\n") &&
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
    ? node.items.every((item) => item.value.kind === "scalar")
    : node.items.every((item) => item.kind === "scalar");
}

function scalarNeedsQuotesInFlow(value: string): boolean {
  // Dump the value inside a flow array so js-yaml applies the same scalar
  // rules it would use for an inline collection. If the result starts with
  // `["`, the value cannot be emitted plainly in flow style, so we switch the
  // actual fixture value to single quotes to match the existing fixtures.
  return dump([value], {
    flowLevel: 0,
    quoteStyle: "double",
    // Use YAML 1.1 schema to preserve existing fixtures where legacy
    // boolean-like strings such as `y` and `n` are quoted in flow collections.
    schema: YAML11_SCHEMA,
  }).startsWith('["');
}
