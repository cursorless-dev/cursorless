import type {
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/lib-common";
import { getKey } from "@cursorless/lib-common";
import type {
  Mark,
  PrimitiveTargetDescriptor,
} from "../typings/TargetDescriptor";

export function extractTargetKeys(target: PartialTargetDescriptor): string[] {
  switch (target.type) {
    case "primitive":
      return extractPrimitiveTargetKeys(target);

    case "list":
      return target.elements.flatMap(extractTargetKeys);

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
