import { isDeepStrictEqual } from "util";
import { PartialPrimitiveTargetDescriptor } from "../../../typings/targetDescriptor.types";

const STRICT_HERE = {
  type: "primitive",
  mark: { type: "cursor" },
  selectionType: "token",
  position: "contents",
  modifier: { type: "identity" },
  insideOutsideType: "inside",
};
const IMPLICIT_TARGET: PartialPrimitiveTargetDescriptor = {
  type: "primitive",
  isImplicit: true,
};
export const upgradeStrictHere = (
  target: PartialPrimitiveTargetDescriptor
): PartialPrimitiveTargetDescriptor =>
  isDeepStrictEqual(target, STRICT_HERE) ? IMPLICIT_TARGET : target;
