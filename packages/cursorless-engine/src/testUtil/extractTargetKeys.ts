import {
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  getKey,
} from "@cursorless/common";
import {
  PrimitiveTargetDescriptor,
  TargetDescriptor,
} from "../typings/TargetDescriptor";

export function extractTargetKeys(
  target: TargetDescriptor | PartialTargetDescriptor,
): string[] {
  switch (target.type) {
    case "primitive":
      return extractPrimitiveTargetKeys(target);

    case "list":
      return target.elements.map(extractTargetKeys).flat();

    case "range":
      return [
        ...extractTargetKeys(target.anchor),
        ...extractPrimitiveTargetKeys(target.active),
      ];

    case "implicit":
      return [];
  }
}

function extractPrimitiveTargetKeys(
  ...targets: (PrimitiveTargetDescriptor | PartialPrimitiveTargetDescriptor)[]
) {
  const keys: string[] = [];
  targets.forEach((target) => {
    if (target.mark?.type === "decoratedSymbol") {
      const { character, symbolColor } = target.mark;
      keys.push(getKey(symbolColor, character));
    }
  });
  return keys;
}
