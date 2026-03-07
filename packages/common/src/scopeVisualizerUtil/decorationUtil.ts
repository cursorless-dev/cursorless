import { BorderStyle } from "./decorationStyle.types";
import type { DecorationStyle } from "./decorationStyle.types";

export const BORDER_WIDTH = "1px";
export const BORDER_RADIUS = "2px";

export function getBorderStyle(borders: DecorationStyle): string {
  return [borders.top, borders.right, borders.bottom, borders.left].join(" ");
}

export function getBorderColor(
  solidColor: string,
  porousColor: string,
  borders: DecorationStyle,
): string {
  return [
    borders.top === BorderStyle.solid ? solidColor : porousColor,
    borders.right === BorderStyle.solid ? solidColor : porousColor,
    borders.bottom === BorderStyle.solid ? solidColor : porousColor,
    borders.left === BorderStyle.solid ? solidColor : porousColor,
  ].join(" ");
}

export function getBorderRadius(borders: DecorationStyle): string {
  return [
    getSingleCornerBorderRadius(borders.top, borders.left),
    getSingleCornerBorderRadius(borders.top, borders.right),
    getSingleCornerBorderRadius(borders.bottom, borders.right),
    getSingleCornerBorderRadius(borders.bottom, borders.left),
  ].join(" ");
}

export function useSingleCornerBorderRadius(
  side1: BorderStyle,
  side2: BorderStyle,
): boolean {
  // We only round the corners if both sides are solid, as that makes them look
  // more finished, whereas we want the dotted borders to look unfinished / cut
  // off.
  return side1 === BorderStyle.solid && side2 === BorderStyle.solid;
}

export function getSingleCornerBorderRadius(
  side1: BorderStyle,
  side2: BorderStyle,
) {
  return useSingleCornerBorderRadius(side1, side2) ? BORDER_RADIUS : "0px";
}
