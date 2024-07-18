import {
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
  getKey,
} from "@cursorless/common";
import { Mark, PrimitiveTargetDescriptor } from "../typings/TargetDescriptor";

export function extractTargetKeys(target: PartialTargetDescriptor): string[] {
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
  return targets.flatMap((target) =>
    target.mark == null ? [] : extractMarkKeys(target.mark),
  );
}

function extractMarkKeys(mark: PartialMark | Mark): string[] {
  switch (mark.type) {
    case "range":
      return [...extractMarkKeys(mark.anchor), ...extractMarkKeys(mark.active)];
    case "target":
      return extractTargetKeys(mark.target);
    case "decoratedSymbol":
      return [getKey(mark.symbolColor, mark.character)];
    default:
      return [];
  }
}
