import {
  BORDER_RADIUS,
  BORDER_WIDTH,
  getBorderColor,
  getBorderStyle,
} from "@cursorless/common";
import type { DecorationItem } from "shiki";
import type { BorderRadius, Highlight, Style } from "./types";

export function highlightsToDecorations(
  highlights: Highlight[],
): DecorationItem[] {
  return highlights.map((highlight): DecorationItem => {
    const { start, end } = highlight.range;
    return {
      start,
      end,
      alwaysWrap: true,
      properties: {
        style: getStyleString(highlight.style),
      },
    };
  });
}

function getStyleString(style: Style): string {
  const borderColor = getBorderColor(
    style.borderColorSolid,
    style.borderColorPorous,
    style.borderStyle,
  );
  return (
    `background-color: ${style.backgroundColor};` +
    `border-color: ${borderColor};` +
    `border-style: ${getBorderStyle(style.borderStyle)};` +
    `border-radius: ${getBorderRadius(style.borderRadius)};` +
    `border-width: ${BORDER_WIDTH};`
  );
}

function getBorderRadius(borders: BorderRadius): string {
  return [
    getSingleBorderRadius(borders.topLeft),
    getSingleBorderRadius(borders.topRight),
    getSingleBorderRadius(borders.bottomRight),
    getSingleBorderRadius(borders.bottomLeft),
  ].join(" ");
}

function getSingleBorderRadius(border: boolean | string): string {
  return border ? BORDER_RADIUS : "0px";
}
