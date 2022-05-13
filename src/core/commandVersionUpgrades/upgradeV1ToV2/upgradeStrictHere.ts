import { PartialPrimitiveTarget } from "../typings/Types";
import { isDeepStrictEqual } from "util";

const STRICT_HERE = {
  type: "primitive",
  mark: { type: "cursor" },
  selectionType: "token",
  position: "contents",
  modifier: { type: "identity" },
  insideOutsideType: "inside",
};
const IMPLICIT_TARGET: PartialPrimitiveTarget = {
  type: "primitive",
  isImplicit: true,
};
export const upgradeStrictHere = (
  target: PartialPrimitiveTarget
): PartialPrimitiveTarget =>
  isDeepStrictEqual(target, STRICT_HERE) ? IMPLICIT_TARGET : target;
