import { isEqual } from "lodash-es";
import type { PartialPrimitiveTargetDescriptorV2 } from "@cursorless/common";

const STRICT_HERE = {
  type: "primitive",
  mark: { type: "cursor" },
  selectionType: "token",
  position: "contents",
  modifier: { type: "identity" },
  insideOutsideType: "inside",
};
const IMPLICIT_TARGET: PartialPrimitiveTargetDescriptorV2 = {
  type: "primitive",
  isImplicit: true,
};
export const upgradeStrictHere = (
  target: PartialPrimitiveTargetDescriptorV2,
): PartialPrimitiveTargetDescriptorV2 =>
  isEqual(target, STRICT_HERE) ? IMPLICIT_TARGET : target;
