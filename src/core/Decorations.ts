import * as vscode from "vscode";
import { join } from "path";
import {
  HatStyleName,
  HatGlyphName,
  hatStyleMap,
  hatStyleNames,
} from "./constants";
import { readFileSync } from "fs";
import { DecorationColorSetting } from "../typings/Types";
import FontMeasurements from "./FontMeasurements";

interface GlyphMeasurements {
  hatWidthToCharacterWidthRatio: number;
  verticalOffsetEm: number;
}

const defaultGlyphMeasurements: Record<HatGlyphName, GlyphMeasurements> = {
  default: {
    hatWidthToCharacterWidthRatio: 0.507,
    verticalOffsetEm: -0.05,
  },
  ninja: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
};

export type DecorationMap = {
  [k in HatStyleName]?: vscode.TextEditorDecorationType;
};

export interface NamedDecoration {
  name: HatStyleName;
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

    this.decorations = hatStyleNames.map((styleName) => {
      const { color, glyphName } = hatStyleMap[styleName];
      const { hatWidthToCharacterWidthRatio, verticalOffsetEm } =
        defaultGlyphMeasurements[glyphName];

      console.log(`color: ${color}`);
      console.log(`glyphName: ${glyphName}`);

      // TODO: Don't reconstruct svg for each glyph every time
      const { svg, svgWidthPx, svgHeightPx } = this.processSvg(
        fontMeasurements,
        glyphName,
        hatScaleFactor * hatWidthToCharacterWidthRatio,
        (verticalOffsetEm + userHatVerticalOffsetAdjustment / 100) *
          fontMeasurements.fontSize
      );

      const spanWidthPx =
        svgWidthPx + (fontMeasurements.characterWidth - svgWidthPx) / 2;

      const colorSetting = vscode.workspace
        .getConfiguration("cursorless.colors")
        .get<DecorationColorSetting>(color)!;

      return {
        name: styleName,
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
    glyphName: HatGlyphName,
    hatWidthToCharacterWidthRatio: number,
    hatVerticalOffset: number
  ) {
    const iconPath = join(__dirname, "..", "images", `${glyphName}-hat.svg`);
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
