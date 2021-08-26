import * as vscode from "vscode";
import { join } from "path";
import { COLORS } from "./constants";
import { SymbolColor } from "./constants";
import { readFileSync } from "fs";
import { DecorationColorSetting } from "../typings/Types";
import FontMeasurements from "./FontMeasurements";

const DEFAULT_HAT_WIDTH_TO_CHARACTER_WITH_RATIO = 0.39;
const DEFAULT_HAT_VERTICAL_OFFSET_EM = -0.05;

export type DecorationMap = {
  [k in SymbolColor]?: vscode.TextEditorDecorationType;
};

export interface NamedDecoration {
  name: SymbolColor;
  decoration: vscode.TextEditorDecorationType;
}

export default class Decorations {
  decorations!: NamedDecoration[];
  decorationMap!: DecorationMap;

  constructor(fontMeasurements: FontMeasurements) {
    this.constructDecorations(fontMeasurements);
  }

  destroyDecorations() {
    this.decorations.forEach(({ decoration }) => {
      decoration.dispose();
    });
  }

  constructDecorations(fontMeasurements: FontMeasurements) {
    const hatSizeAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatSizeAdjustment`)!;

    const userHatVerticalOffsetAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatVerticalOffset`)!;

    const hatScaleFactor = 1 + hatSizeAdjustment / 100;

    const { svg, svgWidthPx, svgHeightPx } = this.processSvg(
      fontMeasurements,
      hatScaleFactor * DEFAULT_HAT_WIDTH_TO_CHARACTER_WITH_RATIO,
      (DEFAULT_HAT_VERTICAL_OFFSET_EM + userHatVerticalOffsetAdjustment / 100) *
        fontMeasurements.fontSize
    );

    const spanWidthPx =
      svgWidthPx + (fontMeasurements.characterWidth - svgWidthPx) / 2;

    this.decorations = COLORS.map((color) => {
      const colorSetting = vscode.workspace
        .getConfiguration("cursorless.colors")
        .get<DecorationColorSetting>(color)!;

      return {
        name: color,
        decoration: vscode.window.createTextEditorDecorationType({
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
          light: {
            after: {
              contentIconPath: this.constructColoredSvgDataUri(
                svg,
                colorSetting.light
              ),
            },
          },
          dark: {
            after: {
              contentIconPath: this.constructColoredSvgDataUri(
                svg,
                colorSetting.dark
              ),
            },
          },
          after: {
            margin: `-${svgHeightPx}px 0 0 -${spanWidthPx}px`,
            width: `${spanWidthPx}px`,
            height: `${svgHeightPx}px`,
          },
        }),
      };
    });

    this.decorationMap = Object.fromEntries(
      this.decorations.map(({ name, decoration }) => [name, decoration])
    );
  }

  private constructColoredSvgDataUri(originalSvg: string, color: string) {
    if (
      originalSvg.match(/fill="[^"]+"/) == null &&
      originalSvg.match(/fill:[^;]+;/) == null
    ) {
      throw Error("Raw svg doesn't have fill");
    }

    const svg = originalSvg
      .replace(/fill="[^"]+"/, `fill="${color}"`)
      .replace(/fill:[^;]+;/, `fill:${color};`);

    const encoded = Buffer.from(svg).toString("base64");

    return vscode.Uri.parse(`data:image/svg+xml;base64,${encoded}`);
  }

  /**
   * Creates an SVG from the hat SVG that pads, offsets and scales it to end up
   * in the right size / place relative to the character it will be placed over.
   * [This image](../images/svg-calculations.png) may or may not be helpful.
   *
   * @param fontMeasurements Info about the user's font
   * @param hatWidthToCharacterWidthRatio How wide should hats be relative to character width
   * @param hatVerticalOffset How far off top of characters should hats be
   * @returns An object with the new SVG and its measurements
   */
  private processSvg(
    fontMeasurements: FontMeasurements,
    hatWidthToCharacterWidthRatio: number,
    hatVerticalOffset: number
  ) {
    const iconPath = join(__dirname, "..", "images", "ninja-hat.svg");
    const rawSvg = readFileSync(iconPath, "utf8");

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const hatWidthPx =
      hatWidthToCharacterWidthRatio * fontMeasurements.characterWidth;
    const hatHeightPx =
      (originalViewBoxHeight / originalViewBoxWidth) * hatWidthPx;

    const svgWidthPx = Math.ceil(fontMeasurements.characterWidth);
    const svgHeightPx =
      fontMeasurements.characterHeight + hatHeightPx + hatVerticalOffset;

    const newViewBoxWidth =
      ((originalViewBoxWidth / hatWidthToCharacterWidthRatio) *
        fontMeasurements.characterWidth) /
      svgWidthPx;
    const newViewBoxHeight = (newViewBoxWidth * svgHeightPx) / svgWidthPx;
    const newViewBoxX = -(newViewBoxWidth - originalViewBoxWidth) / 2;
    const newViewBoxY = 0;

    const newViewBoxString = `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`;

    if (
      rawSvg.match(/width="[^"]+"/) == null ||
      rawSvg.match(/height="[^"]+"/) == null
    ) {
      throw Error("Raw svg doesn't have height or width");
    }

    const svg = rawSvg
      .replace(/width="[^"]+"/, `width="${svgWidthPx}px"`)
      .replace(/height="[^"]+"/, `height="${svgHeightPx}px"`)
      .replace(/viewBox="([^"]+)"/, `viewBox="${newViewBoxString}"`);

    return {
      svg,
      svgHeightPx,
      svgWidthPx,
    };
  }

  private getViewBoxDimensions(rawSvg: string) {
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch == null) {
      throw Error("View box not found in svg");
    }

    const originalViewBoxString = viewBoxMatch[1];
    const [_0, _1, originalViewBoxWidthStr, originalViewBoxHeightStr] =
      originalViewBoxString.split(" ");

    const originalViewBoxWidth = Number(originalViewBoxWidthStr);
    const originalViewBoxHeight = Number(originalViewBoxHeightStr);

    return { originalViewBoxHeight, originalViewBoxWidth };
  }
}
