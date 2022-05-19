import { isDeepStrictEqual } from "util";
import { PartialPrimitiveTargetDesc } from "../../../typings/target.types";

const STRICT_HERE = {
  type: "primitive",
  mark: { type: "cursor" },
  selectionType: "token",
  position: "contents",
  modifier: { type: "identity" },
  insideOutsideType: "inside",
};
const IMPLICIT_TARGET: PartialPrimitiveTargetDesc = {
  type: "primitive",
  isImplicit: true,
};
export const upgradeStrictHere = (
  target: PartialPrimitiveTargetDesc
): PartialPrimitiveTargetDesc =>
  isDeepStrictEqual(target, STRICT_HERE) ? IMPLICIT_TARGET : target;
