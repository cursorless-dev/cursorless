import type { BorderStyle } from "@cursorless/common";
import type { DifferentiatedStyle } from "./decorationStyle.types";

/**
 * Returns a list of values that uniquely definees a differentiated style, for
 * use as a key in a {@link CompositeKeyDefaultMap}.
 */
export function getDifferentiatedStyleMapKey({
  style: { top, right, bottom, left, isWholeLine },
  differentiationIndex,
}: DifferentiatedStyle): [
  BorderStyle,
  BorderStyle,
  BorderStyle,
  BorderStyle,
  boolean,
  number,
] {
  return [top, right, bottom, left, isWholeLine ?? false, differentiationIndex];
}
